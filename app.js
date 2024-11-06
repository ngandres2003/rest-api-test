const express = require("express")
const crypto = require("node:crypto")
const cors = require("cors")
const movies = require('./movies.json')
const { validateMovie,  validatePartialMovie} = require('./schemas/movies')

const app = express()
const PORT = process.env.PORT || 3000
app.disable('x-powered-by')


app.use(express.json())
app.use(cors())

app.get('/', (req, res)=>{
    res.send("<h1>Buscador de Peliculas</h1>")
})

app.get('/movies', (req,res)=>{

    const { genre } = req.query
    if (genre){
        const filteredMovies = movies.filter(
            movie =>  movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
   
})

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)
  
    if (!result.success) {
      // 422 Unprocessable Entity
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
  
    const newMovie = {
      id: crypto.randomUUID(), // uuid v4
      ...result.data
    }
  
    movies.push(newMovie)
  
    res.status(201).json(newMovie)
  })

app.delete('/movies/:id', (req, res) =>{

  const { id } = req.params

  const findMovieIndex = movies.findIndex(movie => movie.id === id)


  if (findMovieIndex === -1){
    return res.status(400).json("{Message: Movie not found}")
  }
  const movieToRemove = movies[findMovieIndex]

  movies.splice(findMovieIndex, 1)
  res.status(200).json(movieToRemove)




})


app.patch('/movies/:id', (req, res)=>{
    console.log(req.body)
    const result = validatePartialMovie(req.body)
    if (!result.success) {
        return res.status(400).json({error: "Error 400"}
        )
    }
    console.log(req.params)
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex === -1) {
        return res.status(404).json({error: "Error 400 movie not found"})
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)

  })
 
app.get('/movies/:id', (req, res) =>{
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)

    if(movie)return res.json(movie)
    res.status(400).send("<h1>Movie not found</h1>")
    
})


app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})