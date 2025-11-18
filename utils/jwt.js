// JWT Utility Functions

// Token'ı decode et
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Token decode hatası:', error);
    return null;
  }
}

// Token'ın geçerli olup olmadığını kontrol et
function isTokenValid(token) {
  if (!token) return false;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp > currentTime;
}

// Token'dan kullanıcı ID'sini al
function getUserIdFromToken(token) {
  const decoded = decodeToken(token);
  return decoded ? decoded.id : null;
}

// Token'ı localStorage'a kaydet
function saveToken(token) {
  localStorage.setItem('token', token);
}

// Token'ı localStorage'dan al
function getToken() {
  return localStorage.getItem('token');
}

// Token'ı localStorage'dan sil
function removeToken() {
  localStorage.removeItem('token');
}

// Kullanıcı bilgilerini localStorage'a kaydet
function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Kullanıcı bilgilerini localStorage'dan al
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Kullanıcı bilgilerini localStorage'dan sil
function removeUser() {
  localStorage.removeItem('user');
}

// Oturum açmış kullanıcıyı kontrol et
function isAuthenticated() {
  const token = getToken();
  return token && isTokenValid(token);
}

// Oturumu kapat
function logout() {
  removeToken();
  removeUser();
}

export {
  decodeToken,
  isTokenValid,
  getUserIdFromToken,
  saveToken,
  getToken,
  removeToken,
  saveUser,
  getUser,
  removeUser,
  isAuthenticated,
  logout
};