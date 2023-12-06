const cors = require('cors')
const express = require('express')
const elasticRoutes = require('./routes/elastic')
const { esClient, checkConnection, setBooksMapping, createIndex } = require('./elastic')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Welcome to the bkmrkd Elasticsearch API' })
})

app.use('/api/elastic', elasticRoutes)

app.get('*', (req, res) => {
  res.status(404).json({ status: 'error', message: 'Invalid route' })
})

PORT = process.env.PORT || 5001

app.listen(PORT, async () => {
  const isElasticReady = await checkConnection()

  if (isElasticReady) {

    const elasticIndex = await esClient.indices.exists({ index: 'books' })

    if (!elasticIndex.body) {
      await createIndex('books')
      await setBooksMapping()
    }
  }
  console.log(`Server running on port ${PORT}`)
})