// "- Using Regexp: Create a function to check that if Email is valid of not
// - Using Regexp: Create a function to check that if password is valid or not - Has at least 8 characters with at least 1 uppercase letter, 1 number, 1 special character."

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}



function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return passwordRegex.test(password);
}

// ^ bắt đầu chuỗi
// (?=.*[A-Z]) phải có ít nhất 1 chữ hoa
// (?=.*\d) phải có ít nhất 1 số
// (?=.*[^A-Za-z0-9]) phải có ít nhất 1 ký tự đặc biệt
// .{8,} tối thiểu 8 ký tự
// $ kết thúc chuỗi

console.log(isValidEmail("abc@gmail.com")); 
// true

console.log(isValidEmail("abc.test@gmail.com")); 
// true

console.log(isValidEmail("abc@gmail")); 
// false

console.log(isValidEmail("abcgmail.com")); 
// false

console.log(isValidEmail("abc@.com")); 
// false

console.log(isValidEmail("abc @gmail.com")); 
// false


console.log(isValidPassword("Abcdef1!")); 
// true

console.log(isValidPassword("Password1@")); 
// true

console.log(isValidPassword("abcdef1!")); 
// false, thiếu chữ hoa

console.log(isValidPassword("Abcdefgh!")); 
// false, thiếu số

console.log(isValidPassword("Abcdef12")); 
// false, thiếu ký tự đặc biệt

console.log(isValidPassword("Ab1!")); 
// false, chưa đủ 8 ký tự