// Create and send Token and save in the cookie.

const sendToken = (user, statusCode, res) => {

  //Create Jwt Token
  const token = user.getJwtToken();

  // Options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    //With this key in true guarantee that the cookie cant be access by JS Code.
    httpOnly: true,
    
    
  }
  res.setHeader('Set-Cookie', 'token=YOUR_TOKEN; SameSite=None; Secure');

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user
  })

}

module.exports = sendToken;