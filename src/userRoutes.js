const express = require('express');

const router = express.Router();

const {
  serveEditProfilePage, 
  authorizeUser,
  saveDetails,
  serveSignUpPage,
  serveAskQuestion,
  saveQuestion,
  saveAnswer,
  addVote,
  deleteVote,
  verifyAnswerAcceptance,
  acceptAnswer,
  rejectAnswer,
  saveComment,
  updateNote
} = require('./handlers');

router.use(authorizeUser);
router.get('/editProfile', serveEditProfilePage);
router.get('/signUpForm', serveSignUpPage);
router.get('/askQuestion', serveAskQuestion);
router.post('/saveDetails', saveDetails);
router.post('/saveQuestion', saveQuestion);
router.post('/saveAnswer', saveAnswer);
router.post('/addVote', addVote);
router.post('/deleteVote', deleteVote);
router.post('/acceptAnswer', verifyAnswerAcceptance, acceptAnswer);
router.post('/rejectAnswer', verifyAnswerAcceptance, rejectAnswer);
router.post('/saveComment', saveComment);
router.post('/editNote', updateNote)

module.exports = router;
