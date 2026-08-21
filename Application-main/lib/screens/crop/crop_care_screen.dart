import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class CropLifeCycleScreen extends StatefulWidget {
  const CropLifeCycleScreen({super.key});

  @override
  State<CropLifeCycleScreen> createState() => _CropLifeCycleScreenState();
}

class _CropLifeCycleScreenState extends State<CropLifeCycleScreen>
    with SingleTickerProviderStateMixin {

  final TextEditingController cropNameCtrl = TextEditingController();
  DateTime? sowingDate;

  late AnimationController animController;
  late Animation<double> fadeAnim;
  late Animation<Offset> slideAnim;

  // State for expandable stages
  bool isInitialExpanded = false;
  bool isOngoingExpanded = false;
  bool isFinalExpanded = false;

  @override
  void initState() {
    super.initState();

    animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    fadeAnim = Tween<double>(begin: 0, end: 1)
        .animate(CurvedAnimation(parent: animController, curve: Curves.easeOut));

    slideAnim = Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero)
        .animate(CurvedAnimation(parent: animController, curve: Curves.easeOut));
  }

  void pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: sowingDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
    );

    if (picked != null) {
      setState(() {
        sowingDate = picked;
      });
      animController.forward();
    }
  }

  String format(DateTime date) => DateFormat("yyyy-MM-dd").format(date);

  DateTime get germinationDate => sowingDate!.add(const Duration(days: 14));
  DateTime get floweringDate => sowingDate!.add(const Duration(days: 48));
  DateTime get harvestDate => sowingDate!.add(const Duration(days: 85));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Image with Overlay
          Stack(
            children: [
              Opacity(
                opacity: 0.95, // Very low opacity for the background image
                child: Container(
                  decoration: const BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage("assets/images/bg_images/bg_image8.jpg"),
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

          // Glass UI Main Content
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 25),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  // Title
                  Text(
                    "🌾 Crop Life Cycle",
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white.withOpacity(0.95),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "Manage crop stages with smart date calculation.",
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.85),
                    ),
                  ),

                  const SizedBox(height: 35),

                  // Glass Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.20),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.30),
                      ),
                      boxShadow: [
                        BoxShadow(
                          blurRadius: 12,
                          color: Colors.black.withOpacity(0.15),
                        )
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Add Crop",
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Colors.white.withOpacity(0.9))),

                        const SizedBox(height: 10),

                        _glassTextField("Enter Crop Name", cropNameCtrl),

                        const SizedBox(height: 25),

                        Text("Add Sowing Date",
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Colors.white.withOpacity(0.9))),

                        const SizedBox(height: 10),

                        GestureDetector(
                          onTap: pickDate,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 18, vertical: 18),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  sowingDate == null
                                      ? "Select Sowing Date"
                                      : format(sowingDate!),
                                  style: const TextStyle(
                                      fontSize: 17, color: Colors.white),
                                ),
                                const Icon(Icons.calendar_month_rounded,
                                    size: 26, color: Colors.white),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 40),

                  if (sowingDate != null)
                    FadeTransition(
                      opacity: fadeAnim,
                      child: SlideTransition(
                        position: slideAnim,
                        child: _buildStageCard(),
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

  // ------------------------ GLASS TEXTFIELD ------------------------
  Widget _glassTextField(String hint, TextEditingController controller) {
    return TextField(
      controller: controller,
      style: const TextStyle(color: Colors.white, fontSize: 17),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
        filled: true,
        fillColor: Colors.white.withOpacity(0.15),
        contentPadding: const EdgeInsets.all(18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  // ------------------------ STAGE CARD ------------------------
  Widget _buildStageCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.25),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withOpacity(0.28)),
        boxShadow: [
          BoxShadow(
              blurRadius: 20, color: Colors.black.withOpacity(0.15)),
        ],
      ),
      child: Column(
        children: [
          // Initial Stage
          _buildExpandableStage(
            title: "🌱 Initial Stage",
            isExpanded: isInitialExpanded,
            onTap: () => setState(() => isInitialExpanded = !isInitialExpanded),
            mainStages: [
              {"title": "Sowing", "date": format(sowingDate!), "icon": Icons.grass},
            ],
            subStages: [
              {"title": "Seed Preparation", "date": format(sowingDate!.subtract(const Duration(days: 2))), "icon": Icons.settings},
              {"title": "Soil Preparation", "date": format(sowingDate!.subtract(const Duration(days: 1))), "icon": Icons.terrain},
            ],
          ),

          const SizedBox(height: 20),

          // Ongoing Stage
          _buildExpandableStage(
            title: "🌿 Ongoing Stage",
            isExpanded: isOngoingExpanded,
            onTap: () => setState(() => isOngoingExpanded = !isOngoingExpanded),
            mainStages: [
              {"title": "Germination", "date": format(germinationDate), "icon": Icons.spa},
              {"title": "Flowering", "date": format(floweringDate), "icon": Icons.local_florist},
            ],
            subStages: [
              {"title": "Vegetative Growth", "date": format(germinationDate.add(const Duration(days: 10))), "icon": Icons.grass},
              {"title": "Fruit Development", "date": format(floweringDate.add(const Duration(days: 15))), "icon": Icons.apple},
              {"title": "Maturation", "date": format(floweringDate.add(const Duration(days: 25))), "icon": Icons.psychology},
            ],
          ),

          const SizedBox(height: 20),

          // Final Stage
          _buildExpandableStage(
            title: "🌾 Final Stage",
            isExpanded: isFinalExpanded,
            onTap: () => setState(() => isFinalExpanded = !isFinalExpanded),
            mainStages: [
              {"title": "Harvest", "date": format(harvestDate), "icon": Icons.agriculture},
            ],
            subStages: [
              {"title": "Post-Harvest", "date": format(harvestDate.add(const Duration(days: 2))), "icon": Icons.inventory},
              {"title": "Storage", "date": format(harvestDate.add(const Duration(days: 5))), "icon": Icons.warehouse},
            ],
          ),
        ],
      ),
    );
  }

  // ------------------------ EXPANDABLE STAGE ------------------------
  Widget _buildExpandableStage({
    required String title,
    required bool isExpanded,
    required VoidCallback onTap,
    required List<Map<String, dynamic>> mainStages,
    required List<Map<String, dynamic>> subStages,
  }) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      margin: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          // Header
          GestureDetector(
            onTap: onTap,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: LinearGradient(
                  colors: [
                    Colors.white.withOpacity(0.1),
                    Colors.white.withOpacity(0.05),
                  ],
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  AnimatedRotation(
                    turns: isExpanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 300),
                    child: Icon(
                      Icons.expand_more,
                      color: Colors.white.withOpacity(0.8),
                      size: 28,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Main Stages (always visible)
          ...mainStages.map((stage) => _buildStageTile(
            stage['title'],
            stage['date'],
            stage['icon'],
            isMain: true,
          )),

          // Sub Stages (expandable)
          AnimatedCrossFade(
            duration: const Duration(milliseconds: 300),
            crossFadeState: isExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            firstChild: const SizedBox.shrink(),
            secondChild: Column(
              children: subStages.map((stage) => _buildStageTile(
                stage['title'],
                stage['date'],
                stage['icon'],
                isMain: false,
              )).toList(),
            ),
          ),
        ],
      ),
    );
  }

  // ------------------------ STAGE TILE ------------------------
  Widget _buildStageTile(String title, String date, IconData icon, {bool isMain = false}) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Icon(
              icon,
              color: Colors.white,
              size: 30,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(title,
                style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.white)),
          ),
          Text(date,
              style: const TextStyle(
                  fontSize: 16,
                  color: Colors.white,
                  fontWeight: FontWeight.bold)),
        ],
      ),
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
