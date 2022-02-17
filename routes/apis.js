require("dotenv").config();
const PORT = process.env.PORT || 8080;
const express = require('express');
const { user } = require('pg/lib/defaults');
const router = express.Router();

module.exports = (db) => {

  // //get questions and answers with quiz id
  // router.get("/:quizId", (req, res) => {

  //   const quizId = req.params.quizId;

  //   db.getQuestionsWithQuizId
  //     .then(data => {
  //       const widgets = data.rows;
  //       res.json({ widgets });
  //     })
  //     .catch(err => {
  //       res
  //         .status(500)
  //         .json({ error: err.message });
  //     });
  // });

  // all quizzes for main page
  router.get('/', (req, res) => {

    db.getAllQuizzes()
      .then(data => res.send(data))
      .catch(err => console.log(err.message));

  });

  router.get('/my', (req, res) => {

    let user_id = req.session.userId;

    db.getMyQuizzes(user_id)
      .then(data => res.send(data))
      .catch(err => console.log(err.message));

  });

  // all quizzes of a user
  router.get('/:user_id', (req, res) => {

    const user_id = req.session.userId;

    db.getAllQuizzesOfUser(user_id)
      .then(data => res.send(data))
      .catch(err => console.log(err.message));

  });

  // all results of a user





  // update user_answer
  router.post('/user_answer', (req, res) => {

    const user_id = req.session.userId;
    const quiz_id = req.body.quizId;
    let answers = req.body.answer;//array of answers.id
    // const quiz_id = req.body.quiz_id;

    // console.log(req.body);
    // console.log(user_id);

    // const UserAnswer = new Promise((resolve, reject) => {

    async function execute() {

      let attempt = await db.getUserAttempt(user_id, quiz_id);
      let answer = [];
      if (!Array.isArray(answers)) {
        answer.push(answers);
        answers = answer;
        console.log('api user_answer', answers)
      }
      // console.log('api attempt',attempt)
      for (let x of answers) {

        db.addUserAnswer(user_id, x, attempt);
        // .then(data => res.send(data))
        // .catch(err => console.log(err.message));
      };

      const num = await db.getNumberOfQuestions(quiz_id);
      const score = await db.getScore(user_id, quiz_id, num.count, attempt);

      return await db.addResult(user_id, quiz_id, score)
        .then(result => result);
    }

    execute()
      .then(result => {

        res.send(result);
        // res.redirect(200, `http://localhost:8080/result/${user_id}_${result.id}`);

      })
  });
  // db.getNumberOfQuestions(quiz_id)
  //   .then((num) => {

  //     db.getScore(user_id, quiz_id, num.count)
  //       .then((score) => {


  // db.addResult(user_id, quiz_id, score, started_at)


  // });

  // UserAnswer
  //   .then(() => {


  // })





  // update quiz in creating new quizzes
  router.post('/newQuiz', (req, res) => {

    console.log(req.body);
    let quiz_id;
    const user_id = req.session.userId;
    const data = req.body; //one quiz object
    // let questions = [];

    const quiz = {

      "user_id": user_id,
      "title": data.quiz_title,
      "is_Hidden": data.quiz_isHidden ? true : false,
      "level_of_difficulty": Number(data.quiz_level_of_difficulty),
      "subject": data.quiz_subject,
      "description": data.quiz_description

    };
    // console.log("hiddendata " +data.quiz_isHidden)

    db.addQuiz(quiz)
      .then(data => {

        quiz_id = data.id;
        console.log(data);
        // res.send(data);


      })
      .then(() => {

        async function addQuestionAnswer() {

          let question_title = [];

          if (!Array.isArray(data.question_title)) {

            question_title.push(data.question_title);
          }

          for (let i = 0; i < question_title.length; i++) {

            // console.log('hi:' + data.question_title[i]);

            let question = {
              "quiz_id": quiz_id,
              "title": question_title[i]
            };

            // console.log('hi2:' + question);

            await db.addQuestion(question)
              .then(question => {

                let question_id = question.id;

                if (Array.isArray(data[`question${i}_answer`])) {

                  for (let j = 0; j < data[`question${i}_answer`].length; j++) {

                    let answerCorrectArray = data[`question${i}answer_is_correct`];

                    if (Array.isArray(answerCorrectArray)) {

                      answerCorrectArray = answerCorrectArray.slice(1);

                    }

                    let answer = {
                      "question_id": question_id,
                      "title": data[`question${i}_answer`][j],
                      "is_correct": answerCorrectArray[j]
                    };

                    console.log(answer.question_id)
                    console.log(answer.title)
                    console.log(answer.is_correct)
                    db.addAnswer(answer);

                  };

                } else {

                  let answerCorrectArray = data[`question${i}answer_is_correct`];

                  if (Array.isArray(answerCorrectArray)) {

                    answerCorrectArray = answerCorrectArray.slice(1);

                  }

                  let answer = {
                    "question_id": question_id,
                    "title": data[`question${i}_answer`],
                    "is_correct": answerCorrectArray[0]
                  };

                  console.log(answer.question_id)
                  console.log(answer.title)
                  console.log(answer.is_correct)
                  db.addAnswer(answer);


                }




              })
          }


        };
        addQuestionAnswer();
      })
      .catch(err => console.log('1234:' + err.message));

    // answers.forEach(x => {
    //
    //   .then(data => res.send(data))
    //   .catch(err => console.log(err.message));

    // });

    // .then(() => {

    //   for (let i = 0; i < data.question_title.length; i++) {

    //     // console.log('hi:' + data.question_title[i]);

    //     let answer = {
    //       "question_id": quiz_id,
    //       "title": data.question_title[i]
    //     };

    //     // console.log('hi2:' + question);

    //     db.addAnswer(answer);

    //   };

    // })

  });

  router.get("/quiz/:quizId", (req, res) => {

    const quiz_id = req.params.quizId;
    const user_id = req.session.userId;
    let questionsArray = [];
    // let answersArray = {};
    // let quiz;

    db.getQuizWithQuizId(quiz_id)
      .then(q => {
        const quiz = q

        db.getQuestionsWithQuizId(quiz_id)
          .then(questions => {

            questionsArray = questions;
            // console.log('qA' + questionsArray)
            let promisesArray = [];

            for (let x of questions) {

              promisesArray.push(db.getAnswersWithQuestionId(x.id));
              // .then(answers => {
              //   // console.log(answers)
              //   // x.answers = answers;
              //   // answersArray.push(answers);
              //   answersArray[`question${x.id}`] = answers;
              //   // console.log(answersArray[`question${x.id}`]);
              //   // res.send({questions, answers});

              // })
            }

            console.log(promisesArray, 'promise all')
            Promise.all(promisesArray).then((values) => {

              console.log('promise values', values)
              console.log({ "user_id": user_id, "quiz": quiz, "questions": questionsArray, "answers": values })
              res.send({ "user_id": user_id, "quiz": quiz, "questions": questionsArray, "answers": values });

            });

          })

      })
      .catch(err => console.log(err.message));

    // setTimeout(() => {res.send({ "questions": questionsArray, "answers": answersArray })}, 1000);

  });

  router.get("/result/:userId_resultId", (req, res) => {

    const userId_resultId = req.params.userId_resultId;
    const array = userId_resultId.replace('?', '').split('_');
    const userId = Number(array[0]);
    const resultId = Number(array[1]);

    console.log(userId, 'this')
    console.log(resultId, 'this')

    db.getResult(resultId)
      .then((result) => {

        db.getUserWithId(userId)
          .then(user => {

            db.getQuizWithQuizId(result.quiz_id)
              .then(quiz => {

                res.send({ "username": user.name, "quiz": quiz.title, "score": result.score, "completed_at": result.completed_at });

              })

          })

      })


  });

  return router;
};



// /Users
// /API QUIZZES THAT BELONG TO A user
// /QUIZ TO A SPECIFIC QUIZ
// /results/RESULTSID
// /QUIZ/:QUIZID
