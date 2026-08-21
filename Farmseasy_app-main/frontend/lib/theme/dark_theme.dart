// lib/app/theme/dark_theme.dart
import 'package:flutter/material.dart';
import 'theme_colors.dart';

final ThemeData darkTheme = ThemeData(
  brightness: Brightness.dark,
  primaryColor: AppColors.primaryDark,
  scaffoldBackgroundColor: Colors.black,

  colorScheme: const ColorScheme.dark(
    primary: AppColors.primaryDark,
    secondary: AppColors.secondaryDark,
  ),

  appBarTheme: const AppBarTheme(
    elevation: 0,
    backgroundColor: Colors.black,
    foregroundColor: Colors.white,
  ),

  floatingActionButtonTheme: const FloatingActionButtonThemeData(
    backgroundColor: AppColors.primaryDark,
    foregroundColor: Colors.white,
  ),

  inputDecorationTheme: InputDecorationTheme(
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
    ),
    focusedBorder: const OutlineInputBorder(
      borderSide: BorderSide(color: AppColors.primaryDark),
    ),
  ),
);
