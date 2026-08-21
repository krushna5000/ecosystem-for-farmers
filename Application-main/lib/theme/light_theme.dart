// lib/app/theme/light_theme.dart
import 'package:flutter/material.dart';

class AppLightColors {
  static const Color primary = Color(0xFF4CAF50);
  static const Color secondary = Color(0xFF8BC34A);
  static const Color accent = Color(0xFFCDDC39);

  static const Color textDark = Colors.black87;
  static const Color error = Colors.redAccent;
}

final ThemeData lightTheme = ThemeData(
  brightness: Brightness.light,
  primaryColor: AppLightColors.primary,
  scaffoldBackgroundColor: Colors.grey.shade50,
  fontFamily: 'Poppins',

  colorScheme: const ColorScheme.light(
    primary: AppLightColors.primary,
    secondary: AppLightColors.secondary,
  ),

  appBarTheme: const AppBarTheme(
    elevation: 0,
    backgroundColor: Colors.white,
    foregroundColor: Colors.black,
  ),

  floatingActionButtonTheme: const FloatingActionButtonThemeData(
    backgroundColor: AppLightColors.primary,
    foregroundColor: Colors.white,
  ),

  inputDecorationTheme: InputDecorationTheme(
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppLightColors.primary),
    ),
  ),
);
