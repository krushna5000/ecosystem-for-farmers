import 'package:flutter/material.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool isDarkMode = false;
  String selectedLanguage = 'English';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Image with Overlay
          Stack(
            children: [
              Opacity(
                opacity: 0.7,
                child: Container(
                  decoration: const BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage("assets/images/bg_image/bg_image1.jpg"),
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
            child: Column(
              children: [
                // Title
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Text(
                    "👤 Profile",
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white.withOpacity(0.95),
                    ),
                  ),
                ),

                // ----------------------------
                // USER AVATAR + BASIC DETAILS
                // ----------------------------
                Column(
                  children: [
                    CircleAvatar(
                      radius: 45,
                      backgroundColor: Colors.white.withOpacity(0.3),
                      child: const CircleAvatar(
                        radius: 40,
                        backgroundImage: AssetImage("assets/profile.png"),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      "Sakshi Bidwe",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withOpacity(0.95),
                      ),
                    ),
                    Text(
                      "+91 9876543210",
                      style: TextStyle(
                        fontSize: 15,
                        color: Colors.white.withOpacity(0.85),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // -------------------------------------------------
                // GLASS PANEL CONTAINING DETAILS + SETTINGS UI
                // -------------------------------------------------
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
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
                    child: ListView(
                      children: [
                        // ---------------- Profile Details ----------------
                        buildProfileItem(
                          icon: Icons.location_on_outlined,
                          title: "Location",
                          value: "Aurangabad, Maharashtra",
                        ),
                        buildProfileItem(
                          icon: Icons.pin_drop_outlined,
                          title: "Pincode",
                          value: "431001",
                        ),
                        buildProfileItem(
                          icon: Icons.home_outlined,
                          title: "Farm Address",
                          value: "Bidwe Farm, Aurangabad",
                        ),
                        buildProfileItem(
                          icon: Icons.landscape_outlined,
                          title: "Farm Area",
                          value: "4.5 Acres",
                        ),
                        buildProfileItem(
                          icon: Icons.agriculture_outlined,
                          title: "Current Crop",
                          value: "Soybean",
                        ),

                        const SizedBox(height: 25),

                        // -------------------------------------------------
                        // LANGUAGE SWITCHER
                        // -------------------------------------------------
                        Text(
                          'Language',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Colors.white.withOpacity(0.9),
                          ),
                        ),
                        const SizedBox(height: 10),

                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: DropdownButton<String>(
                            value: selectedLanguage,
                            dropdownColor: Colors.white.withOpacity(0.9),
                            items: <String>['English', 'Hindi', 'Spanish']
                                .map((lang) => DropdownMenuItem(
                                      value: lang,
                                      child: Text(lang, style: const TextStyle(color: Colors.black)),
                                    ))
                                .toList(),
                            onChanged: (value) {
                              if (value != null) {
                                setState(() {
                                  selectedLanguage = value;
                                });
                              }
                            },
                          ),
                        ),

                        const SizedBox(height: 25),

                        // -------------------------------------------------
                        // DARK MODE TOGGLE
                        // -------------------------------------------------
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Dark Mode',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                                color: Colors.white.withOpacity(0.9),
                              ),
                            ),
                            Switch(
                              value: isDarkMode,
                              onChanged: (value) {
                                setState(() {
                                  isDarkMode = value;
                                });
                              },
                            ),
                          ],
                        ),

                        const SizedBox(height: 35),

                        // -------------------------------------------------
                        // LOGOUT BUTTON
                        // -------------------------------------------------
                        Center(
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.pop(context);
                            },
                            style: ElevatedButton.styleFrom(
                              minimumSize: const Size(200, 50),
                              backgroundColor: Colors.redAccent,
                            ),
                            child: const Text('Logout',
                                style: TextStyle(color: Colors.white)),
                          ),
                        ),

                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
              ],
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

  // =====================================================
  // PROFILE LIST TILE
  // =====================================================
  Widget buildProfileItem({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: ListTile(
        leading: Icon(icon, size: 26, color: Colors.white.withOpacity(0.9)),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: Colors.white.withOpacity(0.9),
          ),
        ),
        subtitle: Text(
          value,
          style: TextStyle(
            fontSize: 13,
            color: Colors.white.withOpacity(0.7),
          ),
        ),
        trailing: Icon(
          Icons.edit_outlined,
          color: Colors.white.withOpacity(0.7),
        ),
        onTap: () {},
      ),
    );
  }
}

// =====================================================
// BOTTOM NAV ICON WIDGET
// =====================================================
Widget navIcon(IconData icon, VoidCallback onTap) {
  return IconButton(
    icon: Icon(icon, color: Colors.black, size: 28),
    onPressed: onTap,
  );
}
