import 'package:flutter/material.dart';

class CreateAccountScreen extends StatefulWidget {
  const CreateAccountScreen({super.key});

  @override
  State<CreateAccountScreen> createState() => _CreateAccountScreenState();
}

class _CreateAccountScreenState extends State<CreateAccountScreen> {
  final TextEditingController nameController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          "Create Account",
          style: TextStyle(
            color: Color(0xFF060606),
            fontWeight: FontWeight.w600,
            fontSize: 20,
          ),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF060606)),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 40),

            // FULL NAME LABEL
            const Text(
              "Full Name",
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF859AA7),
              ),
            ),
            const SizedBox(height: 8),

            // FULL NAME INPUT
            TextField(
              controller: nameController,
              style: const TextStyle(fontSize: 16),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFFF5F5F5),
                hintText: "Enter your full name",
                hintStyle: const TextStyle(color: Color(0xFFB0B0B0)),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide:
                      const BorderSide(color: Color(0xFF84A923), width: 2),
                ),
              ),
            ),

            const Spacer(),

            // CREATE ACCOUNT BUTTON
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  if (nameController.text.trim().isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Please enter your name")),
                    );
                    return;
                  }
                  // Navigate to OTP or next screen
                  Navigator.pushNamed(
                    context,
                    '/otp',
                    arguments: nameController.text.trim(),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF84A923),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 4,
                ),
                child: const Text(
                  "Create Account",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}
