# Cookly

Cookly is a mobile app developed as a Capstone project for Ada Developer Academy. The app helps users discover, search, and manage recipes, as well as organize grocery lists and enjoy a personalized cooking experience.

## App Description

Cookly allows users to:
- Browse and search for recipes from around the world
- Search by title or ingredients
- View recommended recipes on the home page
- Create,read,update and delete favorite recipes to their personal account
- Manage a grocery list
- Register, log in, and log out with secure authentication
- Upload images and enjoy animated UI with Lottie

## Feature Set

- **Recommendations:** Automatically displays recommended recipes on the home page.
- **Smart Search:** Search for recipes by title or ingredients.
- **Recipe Details:** View detailed instructions, ingredients, and images for each recipe.
- **Favorites:** Save recipes to your personal account for quick access.
- **Grocery List:** Organize and manage ingredients you need to buy.
- **User Accounts:** Register, log in, and log out; all data is synced to the cloud.
- **Animated Experience:** Lottie animations enhance the user interface.

## Dependencies

Cookly relies on the following libraries and services:

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Firebase (Auth, Firestore, Storage)](https://firebase.google.com/)
- [axios](https://github.com/axios/axios)
- [lottie-react-native](https://github.com/lottie-react-native/lottie-react-native)
- [expo-router](https://expo.github.io/router/docs)
- [@testing-library/react-native](https://testing-library.com/docs/react-native-testing-library/intro/)
- [Spoonacular API](https://spoonacular.com/food-api)
- [Gemini API (Google AI)](https://ai.google.dev/)

## Environment Setup

1. **Clone the repository**
   ```sh
   git clone <your-repo-url>
   cd capstone1
   ```

2. **Install dependencies**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables** 
   - Create a `.env` file in the project root with the following content:
     ```
     EXPO_PUBLIC_API_URL=https://api.spoonacular.com/recipes
     EXPO_PUBLIC_API_KEY=your_spoonacular_api_key
     EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
     EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
     EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
     EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
     ```

4. **Run the app**
   ```sh
   npx expo start
   ```
   Scan the QR code with Expo Go or run on an emulator/device.

5. **Run tests**
   ```sh
   npm test
   # or
   yarn test
   ```

## Additional Notes

- **Firebase Setup:** Create a Firebase project in the Firebase Console and fill in the config values in your `.env` file.
- **API Key Security:** The Spoonacular API key is for development only. For production, consider using a backend proxy for better security.
- **Lottie Animations:** Lottie JSON files are stored in the `assets/` directory.

## Screenshots
<img width="309" height="678" alt="image" src="https://github.com/user-attachments/assets/4be86398-3b00-4f70-aeb3-b4ebd4d33a62" />
<img width="315" height="669" alt="image" src="https://github.com/user-attachments/assets/facac6bd-7430-42ae-8ee6-e0266545ee00" />
<img width="317" height="677" alt="image" src="https://github.com/user-attachments/assets/ddef091a-f387-4e4d-9fdc-bc6a7adc2a16" />
<img width="315" height="667" alt="image" src="https://github.com/user-attachments/assets/f5084e48-cf37-44e8-bf04-0b311ef838b7" />
<img width="312" height="668" alt="image" src="https://github.com/user-attachments/assets/fdb9e007-cd9d-4611-a81b-4f6658995718" />
<img width="312" height="665" alt="image" src="https://github.com/user-attachments/assets/afdc0b99-6973-42bc-b1cc-886ae793b716" />
<img width="325" height="665" alt="image" src="https://github.com/user-attachments/assets/6ece0c84-1934-439f-8ac3-f311bad3f935" />
<img width="329" height="681" alt="image" src="https://github.com/user-attachments/assets/7ef64da5-2920-43c1-98f2-bbb001405ee9" />
<img width="313" height="671" alt="image" src="https://github.com/user-attachments/assets/712a08f0-15af-452f-8b83-368be83eb477" />
<img width="319" height="669" alt="image" src="https://github.com/user-attachments/assets/5e3cc88e-5a9e-4229-a924-2c458682f166" />
<img width="316" height="664" alt="image" src="https://github.com/user-attachments/assets/a7453160-df18-4685-b1f5-c18dac351b76" />

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
