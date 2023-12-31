require('dotenv').config()
const { esClient } = require('../elastic')

let search = async (req, res) => {
    try {
        let searchTerm = req.query.search
        let page = req.query.page || 1
        let pageSize = req.query.pageSize || 10

        let from = (page - 1) * pageSize
        let size = pageSize

        if (searchTerm === null || searchTerm === undefined || searchTerm === '') {
            let query = {
                "query": {
                    "match_all": {}
                }
            }

            let response = await esClient.search({
                index: process.env.ES_INDEX,
                body: query,
                from: from,
                size: size
            })

            if (response.hits.total.value > 0) {
                let totalResults = response.hits.total.value
                let values = response.hits.hits.map((hit) => {
                    return {
                        id: hit._id,
                        title_without_series: hit._source.title_without_series,
                        book_id: hit._source.book_id,
                        score: hit._score
                    }
                })

                res.status(200).json({
                    data: {
                        total_results: totalResults,
                        books: values
                    }
                })
            } else {
                res.status(200).json({
                    data: {
                        total_results: 0,
                        books: []
                    }
                })
            }
        } else {
            let query = {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "multi_match": {
                                    "type": "best_fields",
                                    "query": `${searchTerm}`,
                                    "lenient": true
                                }
                            }
                        ],
                        "filter": [],
                        "should": [],
                        "must_not": []
                    }
                }
            }
            
            let response = await esClient.search({
                index: process.env.ES_INDEX,
                body: query,
                from: from,
                size: size
            })

            if (response.hits.total.value > 0) {
                let totalResults = response.hits.total.value
                let values = response.hits.hits.map((hit) => {
                    return {
                        id: hit._id,
                        title_without_series: hit._source.title_without_series,
                        book_id: hit._source.book_id,
                        score: hit._score
                    }
                })

                res.status(200).json({
                    data: {
                        total_results: totalResults,
                        books: values
                    }
                })
            } else {
                res.status(200).json({
                    data: {
                        total_results: 0,
                        books: []
                    }
                })
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while searching for books.'
        })
    }
}


let indexBook = async (req, res) => {
    try {
        let { title_without_series, book_id } = req.body

        esClient.index({
            index: process.env.ES_INDEX,
            body: { "title_without_series": title_without_series, "book_id": book_id }
        })

        res.status(201).json({
            status: 'successful',
            message: 'Book indexed successfully.'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while indexing the book.'
        })
    }
}

module.exports = { search, indexBook }