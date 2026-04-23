import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      landing: {
        title: "Elderly Helper",
        text: "An app that helps you feel more active, independent, and connected in everyday life.",
        signUp: "Sign Up",
        login: "Log In",
      },

      register: {
        title: "Register",
        fullName: "Full Name",
        email: "Email",
        password: "Password (at least 6 characters)",
        button: "Register",

        successTitle: "Registration Successful!",
        successText:
          "A verification email has been sent. Please check your inbox (including spam) and verify your account.",
        goToLogin: "Go to Login",

        errorFillAll: "Please fill in all fields.",
      },

      login: {
        title: "Log In",
        email: "Email",
        password: "Password",
        button: "Log In",
      },

      auth: {
        invalidEmail: "Invalid email address",
        userNotFound: "User not found",
        wrongPassword: "Wrong password",
        emailInUse: "Email already in use",
        weakPassword: "Password is too weak",
      },
    },
  },

  he: {
    translation: {
      landing: {
        title: "עוזר דיגיטלי לגיל הזהב",
        text: "אפליקציה שעוזרת לכם להרגיש יותר פעילים, עצמאיים ומחוברים ביום־יום.",
        signUp: "הרשמה",
        login: "התחברות",
      },

      register: {
        title: "הרשמה",
        fullName: "שם מלא",
        email: "אימייל",
        password: "סיסמה (לפחות 6 תווים)",
        button: "הרשמה",

        successTitle: "ההרשמה הצליחה!",
        successText:
          "נשלח מייל אימות. בדקו את תיבת הדואר (כולל ספאם) ואשרו את החשבון.",
        goToLogin: "מעבר להתחברות",

        errorFillAll: "נא למלא את כל השדות.",
      },

      login: {
        title: "התחברות",
        email: "אימייל",
        password: "סיסמה",
        button: "התחברות",
      },

      auth: {
        invalidEmail: "כתובת אימייל לא תקינה",
        userNotFound: "משתמש לא נמצא",
        wrongPassword: "סיסמה שגויה",
        emailInUse: "האימייל כבר בשימוש",
        weakPassword: "הסיסמה חלשה מדי",
      },
    },
  },

  ru: {
    translation: {
      landing: {
        title: "Помощник для пожилых",
        text: "Приложение, которое помогает вам чувствовать себя более активными, самостоятельными и вовлечёнными в повседневную жизнь.",
        signUp: "Регистрация",
        login: "Войти",
      },

      register: {
        title: "Регистрация",
        fullName: "Полное имя",
        email: "Электронная почта",
        password: "Пароль (минимум 6 символов)",
        button: "Регистрация",

        successTitle: "Регистрация успешна!",
        successText:
          "Мы отправили письмо для подтверждения. Проверьте почту и подтвердите аккаунт.",
        goToLogin: "Перейти к входу",

        errorFillAll: "Пожалуйста, заполните все поля.",
      },

      login: {
        title: "Войти",
        email: "Электронная почта",
        password: "Пароль",
        button: "Войти",
      },

      auth: {
        invalidEmail: "Неверный email",
        userNotFound: "Пользователь не найден",
        wrongPassword: "Неверный пароль",
        emailInUse: "Email уже используется",
        weakPassword: "Слишком слабый пароль",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;