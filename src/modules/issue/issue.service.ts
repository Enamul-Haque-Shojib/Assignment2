// issue.service.ts

import { pool } from "../../db";
import { CurrentUser, GetIssuesQuery, IssuePayload, UpdateIssuePayload } from "../../types";





export const createIssueIntoDB = async (payload: IssuePayload, reporterId: number) => {

  const {title, description, type} = payload;

  if (!title?.trim()) {
    throw new Error(
      "Title is required"
    );
  }

  if (title.length > 150) {
    throw new Error(
      "Title cannot exceed 150 characters"
    );
  }

  if (!description?.trim()) {
    throw new Error(
      "Description is required"
    );
  }

  if (description.length < 20) {
    throw new Error(
      "Description must be at least 20 characters"
    );
  }

  if (type !== "bug" && type !== "feature_request") {
    throw new Error(
      "Invalid issue type"
    );
  }


  const query = `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      title,
      description,
      type,
      status,
      reporter_id,
      created_at,
      updated_at;
  `;

  const values = [
    title,
    description,
    type,
    reporterId,
  ];

  const result = await pool.query(query, values);

  return result;
};

const getAllIssuesFromDB = async (queryParams: GetIssuesQuery) => {

  const {
    sort = "newest",
    type,
    status,
  } = queryParams;


  const conditions: string[] = [];
  const values: any[] = [];

  if (type) {
    values.push(type);

    conditions.push(
      `type = $${values.length}`
    );
  }

  if (status) {
    values.push(status);

    conditions.push(
      `status = $${values.length}`
    );
  }

  let whereClause = "";

  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(" AND ")}`;
  }


  const orderBy = sort === "oldest" ? "ASC" : "DESC";

 
  const issuesQuery = `
    SELECT
      id,
      title,
      description,
      type,
      status,
      reporter_id,
      created_at,
      updated_at
    FROM issues
    ${whereClause}
    ORDER BY created_at ${orderBy};
  `;

  const issuesResult =
    await pool.query(issuesQuery, values);

  const issues = issuesResult.rows;


  const reporterIds = [
    ...new Set(
      issues.map(
        (issue) =>
          issue.reporter_id
      )
    ),
  ];


  let reportersMap:
    Record<string, any> = {};

  if (reporterIds.length > 0) {

    const reportersQuery = `
      SELECT
        id,
        name,
        role
      FROM users
      WHERE id = ANY($1);
    `;

    const reportersResult = await pool.query(reportersQuery, [reporterIds]);

    reportersMap = reportersResult.rows.reduce((acc, reporter) => {

          acc[reporter.id] =
            reporter;

          return acc;

        },
        {} as Record<string, any>
      );
  }

  const formattedIssues = issues.map((issue) => ({

      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,

      reporter:
        reportersMap[
          issue.reporter_id
        ] || null,

      created_at:
        issue.created_at,

      updated_at:
        issue.updated_at,
    }));

  return formattedIssues;
};

const getSingleIssueFromDB = async (id: number) => {
  const issueQuery = `
    SELECT
      id,
      title,
      description,
      type,
      status,
      reporter_id,
      created_at,
      updated_at
    FROM issues
    WHERE id = $1;
  `;

  const issueResult = await pool.query(issueQuery, [id]);

  const issue = issueResult.rows[0];


  if (!issue) {
    throw new Error(
      "Issue not found"
    );
  }


  const reporterQuery = `
    SELECT
      id,
      name,
      role
    FROM users
    WHERE id = $1;
  `;

  const reporterResult = await pool.query(reporterQuery, [issue.reporter_id]);

  const reporter = reporterResult.rows[0] || null;

  return {

    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,

    reporter,

    created_at: issue.created_at,

    updated_at: issue.updated_at,
  };
};



const updateIssueIntoDB = async (issueId: number, payload: UpdateIssuePayload, currentUser: CurrentUser) => {

  const existingIssueQuery = `
    SELECT *
    FROM issues
    WHERE id = $1;
  `;

  const existingIssueResult = await pool.query(existingIssueQuery, [issueId]);

  const existingIssue = existingIssueResult.rows[0];


  if (!existingIssue) {
    throw new Error(
      "Issue not found"
    );
  }


  const isMaintainer = currentUser.role === "maintainer";

  const isOwner = existingIssue.reporter_id === currentUser.id;

  const isOpen = existingIssue.status === "open";



  if (!isMaintainer) {

    if (!isOwner) {
      throw new Error(
        "You are not allowed to update this issue"
      );
    }

    if (!isOpen) {
      throw new Error(
        "Contributors can only update open issues"
      );
    }
  }


  const {title, description, type} = payload;

  if (title !== undefined && title.length > 150) {
    throw new Error(
      "Title cannot exceed 150 characters"
    );
  }

  if (description !== undefined && description.length < 20) {
    throw new Error(
      "Description must be at least 20 characters"
    );
  }

  if (type !== undefined && type !== "bug" && type !== "feature_request") {
    throw new Error(
      "Invalid issue type"
    );
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (title !== undefined) {
    values.push(title);

    updates.push(
      `title = $${values.length}`
    );
  }

  if (description !== undefined) {
    values.push(description);

    updates.push(`description = $${values.length}`);
  }

  if (type !== undefined) {
    values.push(type);

    updates.push(`type = $${values.length}`);
  }


  if (updates.length === 0) {
    throw new Error(
      "No update data provided"
    );
  }


  values.push(issueId);

  const updateQuery = `
    UPDATE issues
    SET
      ${updates.join(", ")}
    WHERE id = $${values.length}

    RETURNING
      id,
      title,
      description,
      type,
      status,
      reporter_id,
      created_at,
      updated_at;
  `;

  const updatedResult = await pool.query(updateQuery, values);

  return updatedResult.rows[0];
};



const deleteIssueFromDB = async (issueId: number, currentUser: CurrentUser) => {


  if (currentUser.role !== "maintainer") {
    throw new Error(
      "Only maintainers can delete issues"
    );
  }


  const existingIssueQuery = `
    SELECT id
    FROM issues
    WHERE id = $1;
  `;

  const existingIssueResult = await pool.query(existingIssueQuery, [issueId]);

  const existingIssue = existingIssueResult.rows[0];

  if (!existingIssue) {
    throw new Error(
      "Issue not found"
    );
  }


  const deleteQuery = `
    DELETE FROM issues
    WHERE id = $1;
  `;

  await pool.query(deleteQuery, [issueId]);

  return;
};

export const issueService = {
 createIssueIntoDB,
 getAllIssuesFromDB,
 getSingleIssueFromDB,
    updateIssueIntoDB,
    deleteIssueFromDB
};

