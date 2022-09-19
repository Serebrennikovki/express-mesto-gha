const Card = require('../models/card');

const ERROR_CODE_VALIDATION = 400;
const ERROR_CODE_AVAILABILITY = 404;
const ERROR_CODE_DEFAULT = 500;


module.exports.getCards = (req,res) =>{
  Card.find({})
    .then( cards => res.send(cards))
    .catch(error=>res.status(ERROR_CODE_DEFAULT).send({'message': error.message}))
}

module.exports.getCard = (req, res) => {
  Card.findById(req.params.cardId)
    .then((card)=> {
        return res.send(card);
      })
    .catch((error)=>{
      if(error.name === "ValidatorError"){
        return res.status(ERROR_CODE_VALIDATION).send({'message': "Переданы некорректные данные при создании карточки"})
      }
      else if(error.name === 'CastError'){
        return res.status(ERROR_CODE_AVAILABILITY).send({message:`Карточка с указанным ${req.params.cardId} не найдена.`})
      }
      else{
        return res.status(ERROR_CODE_DEFAULT).send({'message': error.message})
      }
})}

module.exports.createCard = (req,res) =>{
  const {name, link} = req.body;
  Card.create({name, link, owner: req.user._id})
    .then(card => res.send({card}))
    .catch((error)=>{
      if(error.name === "ValidationError"){
        return res.status(ERROR_CODE_VALIDATION).send({'message': "Переданы некорректные данные при создании карточки"})
      }
      else{
        return res.status(ERROR_CODE_DEFAULT).send({'message': error})
      }
})
}

module.exports.likeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
  { new: true },
)
  .then((newCard) => {
    if(newCard){
      return res.send(newCard);
    }
    return res.status(ERROR_CODE_AVAILABILITY).send({'message':`Карточка с указанным ${req.params.cardId} не найдена.`});
  })
    .catch((error)=>{
      if (error.name === 'CastError'){
        return res.status(ERROR_CODE_VALIDATION).send({'message': "Переданы некорректные данные при создании карточки"})
      }
      else{
        return res.status(ERROR_CODE_DEFAULT).send({'message': error})
      }
})


module.exports.dislikeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } }, // убрать _id из массива
  { new: true },
)
.then((newCard) => {
  if(newCard){
  return res.send(newCard);}
  else{
    return res.status(ERROR_CODE_AVAILABILITY).send({'message':`Карточка с указанным ${req.params.cardId} не найдена.`});
  }
  })
  .catch((error)=>{
   if (error.name === 'CastError'){
      return res.status(ERROR_CODE_VALIDATION).send({'message':"Переданы некорректные данные при создании карточки"});
    }
    else{
      return res.status(ERROR_CODE_DEFAULT).send({'message': error})
    }
})
module.exports.deleteCard = (req, res) => Card.findByIdAndRemove(req.params.cardId)
  .then((deleteCard)=>{
    if(deleteCard){
      res.send(deleteCard);
    }
    else{
      return res.status(ERROR_CODE_AVAILABILITY).send({'message':`Карточка с указанным ${req.params.cardId} не найдена.`});
    }
  })
  .catch((error)=>{
    if (error.name === 'CastError'){
       return res.status(ERROR_CODE_VALIDATION).send({'message':"Переданы некорректные данные при создании карточки"});
     }
     else{
       return res.status(ERROR_CODE_DEFAULT).send({'message': error})
     }
 })
