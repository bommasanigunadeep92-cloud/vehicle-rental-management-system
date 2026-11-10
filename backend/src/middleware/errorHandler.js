export const errorHandler = (err, req, res, next) => {
  console.error('[Unhandled Error]', {
    method: req.method,
    url: req.url,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // MySQL Duplicate Entry (e.g. unique email or vehicle registration number)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with this unique value already exists (e.g., email or registration number).',
      detail: err.sqlMessage,
    });
  }

  // MySQL Foreign Key Constraint violation
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Database relational integrity constraint violated.',
      detail: err.sqlMessage,
    });
  }

  // MySQL Check constraint violation
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return res.status(400).json({
      success: false,
      message: 'Data constraint check failed (e.g. invalid date range or rating range).',
      detail: err.sqlMessage,
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
