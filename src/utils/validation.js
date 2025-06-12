function isPasswordInvalid(password) {
  const regex = /^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/;

  
  return regex.test(password);
}

module.exports = {
    isPasswordInvalid
}