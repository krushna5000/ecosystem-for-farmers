// lib/main.dart
import 'package:flutter/material.dart';
import 'app/routes.dart';

void main() {
  runApp(const FarmseasyApp());
}

class FarmseasyApp extends StatelessWidget {
  const FarmseasyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Farmseasy",
      debugShowCheckedModeBanner: false,
      initialRoute: '/splash',
      onGenerateRoute: AppRoutes.generateRoute,
    );
  }
}
