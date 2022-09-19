const User = require('../models/user');
const ERROR_CODE_VALIDATION = 400;
const ERROR_CODE_AVAILABILITY = 404;
const ERROR_CODE_DEFAULT = 500;

module.exports.getUsers = (req,res) =>{
  console.log(res.body);
  User.find({})
    .then(users=>res.send(users))
    .catch(error=>res.status(ERROR_CODE_DEFAULT).send({'message': error.message}))
}

module.exports.getUser = (req,res) => {
  User.findById(req.params.userId)
    .then((userInfo) => {
      if(userInfo){
        return res.send(userInfo);
      }
      else{
        return res.status(ERROR_CODE_AVAILABILITY).send({'message': `Пользователь по указанному ${req.params.userId} не найден`});
      }
      })
      .catch(error=>res.status(ERROR_CODE_DEFAULT).send({'message': error.message}))
}

module.exports.postUser = (req,res) =>{
  console.log(req.body);
  const {name, about, avatar} = req.body;
  User.create({name, about, avatar})
    .then((userInfo) => {res.send({data: userInfo})})
    .catch((error)=>{
      if(error.name === "ValidationError"){
        return res.status(ERROR_CODE_VALIDATION).send({'message': "Переданы некорректные данные при создании пользователя"})
      }
      else{
        return res.status(ERROR_CODE_DEFAULT).send({'message': error})
      }
})
}


module.exports.updateUser = (req,res) => {
  console.log(req.body,req.user._id);
  const {name, about} = req.body;
  User.findByIdAndUpdate(req.user._id, {name,about})
    .then(newUserInfo=>res.send(newUserInfo))
    .catch((error)=>{
      if(error.name === "ValidationError"){
        return res.status(ERROR_CODE_VALIDATION).send({'message': "Переданы некорректные данные при обновлении профиля"})
      }
      else{
        return res.status(ERROR_CODE_DEFAULT).send({'message': error})
      }
})
}
module.exports.updateUserAvatar = (req,res) => {
  const {avatar} = req.body;
  User.findByIdAndUpdate(req.user._id, {avatar})
    .then(newUserInfo=>res.send(newUserInfo))
    .catch((error)=>{
      if(error.name === "ValidationError"){
        return res.status(ERROR_CODE_VALIDATION).send({'message': "Переданы некорректные данные при обновлении аватара"})
      }
      else{
        return res.status(ERROR_CODE_DEFAULT).send({'message': error})
      }
})
}