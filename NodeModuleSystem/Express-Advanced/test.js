const Joi = require("@hapi/joi");
const express = require("express");
const app = express();

// Request Processing Pipeline

// Request --> express.json() --> route() --> Response
// Middleware function은 in sequence로 호출됨.

app.use(express.json());
// Creating Custom Middleware
app.use(function(req, res, next) {
  console.log("Logging...");
  // 매 요청마다 발생
  next();
});

app.use(function(req, res, next) {
  console.log("Authenticate...");
  next();
});

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" }
];

app.get("/", (req, res, next) => {
  res.send("Hello World!");
});

app.get("/api/courses", (req, res, next) => {
  res.send(courses);
});

app.get("/api/courses/:id", (req, res, next) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) {
    return res
      .status(404)
      .send("The course with the given ID was not found...");
  }

  res.send(course);
});

app.post("/api/courses", (req, res, next) => {
  const { error } = validateCourse(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const course = {
    id: courses.length + 1,
    name: req.body.name
  };

  courses.push(course);
  res.send(course);
});

app.put("/api/courses/:id", (req, res, next) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) {
    return res
      .status(404)
      .send("The course with the given ID was not found...");
  }

  const { error } = validateCourse(req.body);
  if (error) {
    // If invalid return 400 - Bad Request
    return res.status(400).send(error.details[0].message);
  }

  course.name = req.body.name;
  res.send(course);
});

app.delete("/api/courses/:id", (req, res, next) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) {
    return res.status(404).send("The course with the given ID was not found.");
  }

  const index = courses.indexOf(course);
  courses.splice(index, 1);

  res.send(course);
});

function validateCourse(course) {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .required()
  });

  return schema.validate(course);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});