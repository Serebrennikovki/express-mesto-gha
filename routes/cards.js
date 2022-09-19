const router = require('express').Router();
const {getCard, getCards, createCard, likeCard, dislikeCard} = require('../controllers/cards');

router.get('/cards', getCards);
router.get('/cards/:cardId', getCard);
router.post('/cards', createCard);
router.put('/cards/:cardId/likes', likeCard);
router.delete('/cards/:cardId/likes', dislikeCard);


module.exports = router;