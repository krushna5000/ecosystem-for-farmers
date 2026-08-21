import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class DiagnosisScreen extends StatefulWidget {
  const DiagnosisScreen({super.key});

  @override
  State<DiagnosisScreen> createState() => _DiagnosisScreenState();
}

class _DiagnosisScreenState extends State<DiagnosisScreen> {
  File? _imageFile;
  final ImagePicker _picker = ImagePicker();

  // Temporary disease data
  String detectedDisease = "Leaf Spot Disease";
  String suggestedFertilizer =
      "Recommended: NPK 19-19-19\nApply Fungicide: Copper Oxychloride";

  Future<void> _captureImage() async {
    final XFile? pickedFile =
        await _picker.pickImage(source: ImageSource.camera, imageQuality: 80);

    if (pickedFile != null) {
      setState(() {
        _imageFile = File(pickedFile.path);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Image with Overlay
          Stack(
            children: [
              Opacity(
                opacity: 0.95,
                child: Container(
                  decoration: const BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage("assets/images/bg_image/bg_image4.jpg"),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withOpacity(0.1),
                      Colors.black.withOpacity(0.4),
                    ],
                  ),
                ),
              ),
            ],
          ),
          // Main Content
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Title
                  Text(
                    "🌱 Fertilizer & Disease Detection",
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white.withOpacity(0.95),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "Detect crop diseases and get fertilizer recommendations.",
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.85),
                    ),
                  ),
                  const SizedBox(height: 35),
                  _diagnosisCard(),
                  const SizedBox(height: 20),
                  // Capture Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _captureImage,
                      icon: const Icon(Icons.camera_alt),
                      label: const Text("Choose Image"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade600,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Display Captured Image
                  if (_imageFile != null)
                    Container(
                      width: double.infinity,
                      height: 200,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        image: DecorationImage(
                          image: FileImage(_imageFile!),
                          fit: BoxFit.cover,
                        ),
                      ),
                    )
                  else
                    Container(
                      width: double.infinity,
                      height: 200,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.green.shade200),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.image,
                          size: 50,
                          color: Colors.green,
                        ),
                      ),
                    ),

                  const SizedBox(height: 20),

                  // Disease Card
                  if (_imageFile != null)
                    Card(
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                      elevation: 4,
                      color: Colors.white,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: const [
                                Icon(Icons.dangerous, color: Colors.red),
                                SizedBox(width: 8),
                                Text(
                                  "Detected Disease",
                                  style: TextStyle(
                                      fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              detectedDisease,
                              style: const TextStyle(fontSize: 14),
                            ),
                            const Divider(height: 24, color: Colors.grey),
                            Row(
                              children: const [
                                Icon(Icons.eco, color: Colors.green),
                                SizedBox(width: 8),
                                Text(
                                  "Suggested Fertilizer",
                                  style: TextStyle(
                                      fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              suggestedFertilizer,
                              style: const TextStyle(fontSize: 14),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),

      // ---------------- Bottom Navigation ----------------
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(22),
            topRight: Radius.circular(22),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.09),
              blurRadius: 8,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: BottomAppBar(
          shape: const CircularNotchedRectangle(),
          notchMargin: 10,
          child: SizedBox(
            height: 65,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                navIcon(Icons.home, () {
                  Navigator.pushNamed(context, '/home');
                }),
                navIcon(Icons.favorite, () {
                  Navigator.pushNamed(context, '/diagnosis');
                }),
                const SizedBox(width: 40),
                navIcon(Icons.local_florist, () {
                  Navigator.pushNamed(context, '/crop-life');
                }),
                navIcon(Icons.person, () {
                  Navigator.pushNamed(context, '/profile');
                }),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _diagnosisCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor:
                    const Color.fromARGB(255, 9, 80, 27).withOpacity(0.3),
                child: const Icon(Icons.eco, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    "Quick Crop Diagnosis",
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.bold),
                  ),
                  Text(
                    "Instantly spot Crop issues.",
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 15),

          // Button
          Container(
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(40),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.camera_alt, color: Colors.green, size: 20),
                SizedBox(width: 8),
                Text(
                  "Start Diagnosis",
                  style: TextStyle(
                      color: Colors.black,
                      fontSize: 15,
                      fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          const SizedBox(height: 15),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _progressCircleSmall("1 Day", "10/100", 0.10),
              _progressCircleSmall("2 Days", "80/120", 0.50),
            ],
          ),

          const SizedBox(height: 15),
          const Text(
            "Your progress",
            style: TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: 6),

          Slider(
            value: 80,
            max: 100,
            thumbColor: Colors.greenAccent,
            activeColor: Colors.greenAccent,
            inactiveColor: Colors.white24,
            onChanged: (value) {},
          ),
        ],
      ),
    );
  }

  Widget _progressCircleSmall(String title, String subtitle, double progress) {
    return Column(
      children: [
        SizedBox(
          width: 50,
          height: 50,
          child: CircularProgressIndicator(
            value: progress,
            backgroundColor: Colors.white24,
            valueColor: AlwaysStoppedAnimation<Color>(Colors.greenAccent),
          ),
        ),
        const SizedBox(height: 5),
        Text(title, style: const TextStyle(color: Colors.white, fontSize: 12)),
        Text(subtitle, style: const TextStyle(color: Colors.white70, fontSize: 10)),
      ],
    );
  }
}

// Navigation Icon -------------------------------------------------
Widget navIcon(IconData icon, VoidCallback onTap) {
  return IconButton(
    icon: Icon(icon, color: Colors.black, size: 28),
    onPressed: onTap,
  );
}
