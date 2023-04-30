class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: 'i',
          },
        }
      : {};

    this.query = this.query.find(...keyword);
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // Remove some field for category
    const removeField = ['keyword', 'page', 'limit'];

    removeField.forEach((key) => delete queryCopy[key]);

    // Filter for price and rating eg: price[gt]=1200&price[lt]=2000
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (key) => {
      `$${key}`;
    });

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = ApiFeatures;
