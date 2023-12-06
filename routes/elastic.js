const express = require('express')
const elasticController = require('../controllers/elastic')

const router = express.Router()

router.get('/', elasticController.search)
router.post('/', elasticController.indexBook)

module.exports = router

