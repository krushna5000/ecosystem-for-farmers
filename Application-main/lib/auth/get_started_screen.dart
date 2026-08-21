import 'package:flutter/material.dart';

class GetStartedScreen extends StatelessWidget {
  const GetStartedScreen({super.key});

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
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                border: Border.all(
                  color: Colors.white.withOpacity(0.20),
                ),
                borderRadius: BorderRadius.circular(22),
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
                              color: Colors.white.withOpacity(0.0),
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
                      InfoBox(title: "Area", value: "15 m²"),
                      InfoBox(title: "Yield", value: "12 Tons"),
                      InfoBox(title: "Age", value: "44 Days"),
                    ],
                  ),
                ],
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
                  "WELCOME TO\nFARMSEASY",
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
                  "Plan, grow, and harvest your Farm easily with AI.",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white.withOpacity(0.92),
                  ),
                ),

                const SizedBox(height: 25),

                GestureDetector(
                  onTap: () {
                    Navigator.pushNamed(context, '/login');
                  },
                  child: Container(
                    height: 65,
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
                          height: 50,
                          width: 50,
                          decoration: const BoxDecoration(
                            color: Color(0xFF84A923),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.eco,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),

                        const Text(
                          "Get Started",
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
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class InfoBox extends StatelessWidget {
  final String title;
  final String value;

  const InfoBox({required this.title, required this.value, super.key});

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
