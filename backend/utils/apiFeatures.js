class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword ? {
      name: {
        $regex: this.queryStr.keyword,
        $options: 'i'
      }
    } : {}

    console.log(keyword);
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    //removing fields from the query
    const removeFields = ['keyword', 'limit', 'page']
    removeFields.forEach(elm => delete queryCopy[elm])

    //Advance filter for price , ratings etc
    let queryStr = JSON.stringify(queryCopy)

    //add the $ for the mongo operators, with regex
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resPerPage){
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    this.query = this.query.limit(resPerPage).skip(skip)

    return this
  }
}

module.exports = APIFeatures