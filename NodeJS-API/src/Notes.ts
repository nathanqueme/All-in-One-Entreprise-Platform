


// zip all files/folders and upload the zip to AWS Beanstalk
// http to https : https://stackoverflow.com/a/59775539
// file structure : https://blog.logrocket.com/organizing-express-js-project-structure-better-productivity/
// https://github.com/geshan/expressjs-structure

// server > routes > controllers > services
// server : app.use("path", pathRouter) 
// routes : router._(subpath, _Contoller) 
// controllers : export returnthing() { await service1 ... await service2 ... next() }
// services : export dothing() { SELECT ... from ...  } 
