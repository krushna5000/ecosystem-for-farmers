// lib/app/theme/dark_theme.dart
import 'package:flutter/material.dart';

class AppDarkColors {
  static const Color primary = Color(0xFF2E7D32);
  static const Color secondary = Color(0xFF558B2F);
  static const Color accent = Color(0xFF9E9D24);

  static const Color textLight = Colors.white;
  static const Color error = Colors.redAccent;
}

final ThemeData darkTheme = ThemeData(
  brightness: Brightness.dark,
  primaryColor: AppDarkColors.primary,
  scaffoldBackgroundColor: Colors.black,

  colorScheme: const ColorScheme.dark(
    primary: AppDarkColors.primary,
    secondary: AppDarkColors.secondary,
  ),

  appBarTheme: const AppBarTheme(
    elevation: 0,
    backgroundColor: Colors.black,
    foregroundColor: Colors.white,
  ),

  floatingActionButtonTheme: const FloatingActionButtonThemeData(
    backgroundColor: AppDarkColors.primary,
    foregroundColor: Colors.white,
  ),

  inputDecorationTheme: InputDecorationTheme(
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
    ),
    focusedBorder: const OutlineInputBorder(
      borderSide: BorderSide(color: AppDarkColors.primary),
    ),
  ),
);
