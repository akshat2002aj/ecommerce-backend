module.exports = (model, populate) => async (req, res, next) => {
  let query;

  // Copy Req.query
  const reqQuery = { ...req.query };

  // console.log(query);

  // Field to exclude
  const removeField = ['select', 'sort', 'page', 'limit', 'keyword'];

  //Loop over removeField and delete them from reqQuery
  removeField.forEach((param) => delete reqQuery[param]);

  // query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators like gt gte etc
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  let finalQuery = JSON.parse(queryStr);
  // Search Resource
  if (req.query.keyword) {
    finalQuery['name'] = {
      $regex: req.query.keyword,
      $options: 'i',
    };
  }

  // Finding Resource
  query = model.find(finalQuery);

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort fields
  if (req.query.sort) {
    const sortBy = rq.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // Executing Query
  const results = await query;

  // Pagination Result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};
