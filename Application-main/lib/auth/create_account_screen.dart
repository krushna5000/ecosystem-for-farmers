import 'dart:ui';
import 'package:flutter/material.dart';

class CreateAccountScreen extends StatefulWidget {
  const CreateAccountScreen({super.key});

  @override
  State<CreateAccountScreen> createState() => _CreateAccountScreenState();
}

class _CreateAccountScreenState extends State<CreateAccountScreen> {
  final TextEditingController nameController = TextEditingController();
  final Color brandGreen = const Color(0xFF84A923);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [

          Positioned.fill(
            child: Image.asset(
              "assets/images/farm_bg.jpg",
              fit: BoxFit.cover,
            ),
          ),

          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(0.4),
                    Colors.black.withOpacity(0.1),
                  ],
                ),
              ),
            ),
          ),

          Positioned(
            top: 70,
            left: 20,
            right: 20,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(22),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 18, vertical: 14),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(22),
                    color: Colors.white.withOpacity(0.06),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.20),
                    ),
                  ),
                  child: Column(
                    children: [

                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                height: 35,
                                width: 35,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.white.withOpacity(0.12),
                                  ),
                                ),
                                child: const Center(
                                  child: Text(
                                    "🌾",
                                    style: TextStyle(fontSize: 20),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              const Text(
                                "Create Account",
                                style: TextStyle(
                                  fontSize: 15,
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),

                          Row(
                            children: const [
                              Text(
                                "20°C",
                                style: TextStyle(
                                  fontSize: 18,
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(width: 6),
                              Text("🌥", style: TextStyle(fontSize: 26)),
                            ],
                          ),
                        ],
                      ),

                      const SizedBox(height: 12),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          _InfoBox(title: "Area", value: "15 m²"),
                          _InfoBox(title: "Yield", value: "12 Tons"),
                          _InfoBox(title: "Age", value: "44 Days"),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          Positioned(
            bottom: 35,
            left: 15,
            right: 15,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [

                const Text(
                  "CREATE ACCOUNT",
                  style: TextStyle(
                    fontSize: 34,
                    color: Colors.white,
                    height: 1.2,
                    fontWeight: FontWeight.w700,
                  ),
                ),

                const SizedBox(height: 12),

                Text(
                  "Enter your full name to continue",
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white.withOpacity(0.92),
                  ),
                ),

                const SizedBox(height: 25),

                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.20),
                    borderRadius: BorderRadius.circular(45),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.25),
                    ),
                  ),
                  child: TextField(
                    controller: nameController,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 17,
                    ),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      hintText: "Enter full name",
                      hintStyle: TextStyle(color: Colors.white70),
                      contentPadding: EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),

                const SizedBox(height: 22),

                GestureDetector(
                  onTap: () {
                    if (nameController.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text("Please enter your name"),
                          backgroundColor: brandGreen,
                        ),
                      );
                      return;
                    }

                    Navigator.pushNamed(
                      context,
                      '/login',
                      arguments: nameController.text.trim(),
                    );
                  },
                  child: Container(
                    height: 55,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.20),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.25),
                      ),
                      borderRadius: BorderRadius.circular(45),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.white.withOpacity(0.12),
                          blurRadius: 16,
                          spreadRadius: 1,
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [

                        Container(
                          height: 45,
                          width: 45,
                          decoration: BoxDecoration(
                            color: brandGreen,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.person_add,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),

                        const Text(
                          "Continue",
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),

                        Row(
                          children: const [
                            Icon(Icons.arrow_forward_ios,
                                color: Colors.white, size: 14),
                            SizedBox(width: 2),
                            Icon(Icons.arrow_forward_ios,
                                color: Colors.white, size: 14),
                            Icon(Icons.arrow_forward_ios,
                                color: Colors.white, size: 14),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoBox extends StatelessWidget {
  final String title;
  final String value;

  const _InfoBox({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 90,
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: Colors.white.withOpacity(0.12),
        ),
      ),
      child: Column(
        children: [
          Text(
            title,
            style: TextStyle(
              color: Colors.white.withOpacity(0.85),
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
