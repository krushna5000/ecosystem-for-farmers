import 'dart:ui';
import 'package:flutter/material.dart';

class OtpScreen extends StatefulWidget {
  final String mobile;
  const OtpScreen({super.key, required this.mobile});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final TextEditingController _otpController = TextEditingController();
  bool _isLoading = false;

  final Color brandGreen = const Color(0xFF84A923);

  void _verifyOtp() async {
    if (_otpController.text.trim().length != 6) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Please enter valid 6-digit OTP"),
            backgroundColor: Colors.green,
          ),
        );
      }
      return;
    }

    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1));
    setState(() => _isLoading = false);

    if (mounted) {
      Navigator.pushNamed(context, '/home');
    }
  }

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
                                "Wheat Spike",
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
                  "VERIFY OTP",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 34,
                    color: Colors.white,
                    height: 1.2,
                    fontWeight: FontWeight.w700,
                  ),
                ),

                const SizedBox(height: 12),

                Text(
                  "OTP sent to +91 ${widget.mobile}",
                  textAlign: TextAlign.center,
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
                    controller: _otpController,
                    maxLength: 6,
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 8,
                    ),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      counterText: "",
                      hintText: "••••••",
                      hintStyle: TextStyle(
                        color: Colors.white60,
                        letterSpacing: 8,
                        fontSize: 20,
                      ),
                      contentPadding: EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),

                const SizedBox(height: 22),

                GestureDetector(
                  onTap: _isLoading ? null : _verifyOtp,
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

                        /// ICON CIRCLE
                        Container(
                          height: 45,
                          width: 45,
                          decoration: BoxDecoration(
                            color: brandGreen,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.verified,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),

                        /// TEXT
                        Text(
                          _isLoading ? "Please Wait..." : "Verify OTP",
                          style: const TextStyle(
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

                const SizedBox(height: 18),

              
                GestureDetector(
                  onTap: () {},
                  child: const Text(
                    "Resend OTP",
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 16,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// ---------------- INFO BOX COMPONENT ----------------
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
