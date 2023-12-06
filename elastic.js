require('dotenv').config()
const { Client } = require('@elastic/elasticsearch')

let elasticUrl = 'http://elasticsearch:9200'
let esClient = new Client({ node: elasticUrl })

let indexName = process.env.ES_INDEX

let checkConnection = () => {
  return new Promise(async (resolve) => {
    console.log("Checking connection to ElasticSearch...")

    let isConnected = false

    while (!isConnected) {
      try {
        await esClient.cluster.health({})

        console.log("Successfully connected to ElasticSearch")

        isConnected = true
        // eslint-disable-next-line no-empty
      } catch (_) {
        console.log("Connection failed, retrying in 2 seconds...")
      }
    }
    resolve(true)
  })
}

let createIndex = async (index) => {
  try {
    await esClient.indices.create({ index })

    console.log(`Created index ${index}`)
  } catch (err) {
    console.error(`An error occurred while creating the index ${index}:`)
    console.error(err)
  }
}

let setBooksMapping = async () => {
  try {
    let schema = {
      "title_without_series": { type: 'text' },
      "book_id": { type: 'integer' }
    }

    await esClient.indices.putMapping({ index: indexName, body: { properties: schema } })

    console.log('Subtitle mapping created successfully')
  } catch (error) {
    console.log('An error occurred while setting the subtitle mapping:')
    console.error(error)
  }
}

module.exports = { esClient, checkConnection, setBooksMapping, createIndex }