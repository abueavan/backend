/* eslint-disable no-unused-vars */
require('dotenv').config()  //dotenv gets imported before the note model is imported
const express = require('express')
const app = express()
const Note = require('./models/note')
const bodyParser = require('body-parser')
const requestLogger = (request, response, next) => {
  console.log('Method', request.method)
  console.log('Path  ', request.path)
  console.log('Body  ', request.body)
  console.log('---')
  next()
}
const cors = require('cors')
app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(requestLogger)


app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>')
})

app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes.map(note => note.toJSON()))
  })
})

app.get('/api/notes/:id', (req, res, next) => {   //The next function is passed to the handler as the third parameter:
  Note.findById(req.params.id)
    .then(note => {
      if(note) {
        res.json(note.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (req, res, next) => {
  Note.findByIdAndRemove(res.params.id)
    .then(_ => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

// const generatedId = () => {
//     const maxId = notes.length > 0
//     ? Math.max(...notes.map(n => n.id))
//     : 0
//     return maxId + 1
// }

app.post('/api/notes', (req, res, next) => {
  const body = req.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })
  note.save()
    .then(savedNote => savedNote.toJSON()
    )
    .then(savedAndFormattedNote => {
      res.json(savedAndFormattedNote)
    })
    .catch(error => next(error))

})

app.put('/api/notes/:id', (req, res, next) => {
  // const id = Number(req.params.id)
  // note = notes.find(n => n.id === id)
  // note.important = !note.important
  // res.json(note)
  const body = req.body
  const note = {
    content: body.content,
    important: body.important
  }
  Note.findByIdAndUpdate(req.params.id, note, { new: true })
    .then(updatedNote => {
      res.json(updatedNote.toJSON())
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error : 'malformatted id' })
  } else if(error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

