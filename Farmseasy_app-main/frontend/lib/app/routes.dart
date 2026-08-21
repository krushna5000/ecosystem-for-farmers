import 'package:flutter/material.dart';

import '../auth/splash_screen.dart';
import '../auth/login_screen.dart';
import '../auth/otp_screen.dart';
import '../auth/create_account_screen.dart';

import '../screens/home_screen.dart';
import '../screens/farm/add_farm_screen.dart';
import '../screens/diagnosis/diagnosis_screen.dart';
import '../screens/crop/crop_care_screen.dart';
import '../screens/profile/profile_screen.dart';

class AppRoutes {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {

      case '/splash':
        return MaterialPageRoute(builder: (_) => const SplashScreen());

      case '/login':
        return MaterialPageRoute(builder: (_) => const LoginScreen()); 

      case '/otp':
      final mobile = settings.arguments as String;
      return MaterialPageRoute(
      builder: (_) => OtpScreen(mobile: mobile),
      );

      case '/create-account':
        return MaterialPageRoute(builder: (_) => const CreateAccountScreen());

      case '/home':
        return MaterialPageRoute(builder: (_) => const HomeScreen());

      case '/add-farm':
        return MaterialPageRoute(builder: (_) => const AddFarmScreen());

      case '/diagnosis':
        return MaterialPageRoute(builder: (_) => const DiagnosisScreen());

      case '/crop-life':
        return MaterialPageRoute(builder: (_) => const CropLifeCycleScreen());

      case '/profile':
        return MaterialPageRoute(builder: (_) => const ProfileScreen());

      default:
        return MaterialPageRoute(
          builder: (_) => const Scaffold(
            body: Center(
              child: Text(
                "404 - Screen Not Found",
                style: TextStyle(fontSize: 18),
              ),
            ),
          ),
        );
    }
  }
}
