import 'package:flutter/material.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final List<Map<String, String>> farms = [];
  bool _isButtonPressed = false;

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const _ImprovedHeader(),

            const SizedBox(height: 40),

            // ---------------- Add Farm Button ----------------
            Center(
              child: GestureDetector(
                onTapDown: (_) {
                  setState(() {
                    _isButtonPressed = true;
                  });
                },
                onTapUp: (_) {
                  setState(() {
                    _isButtonPressed = false;
                  });
                },
                onTapCancel: () {
                  setState(() {
                    _isButtonPressed = false;
                  });
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  transform: Matrix4.identity()..scale(_isButtonPressed ? 0.95 : 1.0),
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.green.shade400,
                          Colors.green.shade600,
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(32),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.green.withOpacity(0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        final result = await Navigator.pushNamed(context, '/add-farm');
                        if (result != null && result is Map<String, String>) {
                          setState(() {
                            farms.add(result);
                          });
                        }
                      },
                      icon: const Icon(Icons.add, color: Colors.white, size: 24),
                      label: const Text(
                        "Add Farm",
                        style: TextStyle(fontSize: 18, color: Colors.white, fontWeight: FontWeight.w600),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(32),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 28),

            // ---------------- My Farms Title ----------------
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "My Farms",
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  Container(
                    width: 70,
                    height: 3,
                    margin: const EdgeInsets.only(top: 6),
                    color: Colors.greenAccent,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // ---------------- Empty State ----------------
            farms.isEmpty
                ? const Padding(
                    padding: EdgeInsets.symmetric(vertical: 28),
                    child: Center(
                      child: Text(
                        "No farms added yet.",
                        style: TextStyle(fontSize: 16, color: Colors.black54),
                      ),
                    ),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: farms.length,
                    itemBuilder: (context, index) {
                      final f = farms[index];
                      return _FarmCard(
                        name: f["name"] ?? "Farm",
                        location: f["location"] ?? "",
                        onTap: () {},
                      );
                    },
                  ),

            const SizedBox(height: 110),
          ],
        ),
      ),

      // ---------------- Camera Button ----------------
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: Colors.green.withOpacity(0.85),
        child: const Icon(Icons.camera_alt, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,

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
}

// Navigation Icon -------------------------------------------------
Widget navIcon(IconData icon, VoidCallback onTap) {
  return IconButton(
    icon: Icon(icon, color: Colors.black, size: 28),
    onPressed: onTap,
  );
}

// ======================= IMPROVED HEADER ========================
class _ImprovedHeader extends StatelessWidget {
  const _ImprovedHeader();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 425, // REDUCED HEIGHT (tighter layout)
      child: Stack(
        children: [
          ClipPath(
            clipper: _HeaderCurveClipper(),
            child: Container(
              height: 450,
              width: double.infinity,
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: AssetImage("assets/images/bg_image/bg_image6.jpg"),
                  fit: BoxFit.cover,
                ),
              ),
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.black.withOpacity(0.45),
                      Colors.transparent,
                    ],
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                  ),
                ),
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Avatar + Notification
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border:
                                    Border.all(color: Colors.white, width: 3),
                              ),
                              child: const CircleAvatar(
                                radius: 28,
                                backgroundImage:
                                    AssetImage("assets/images/logo.png"),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  "Hi 👋",
                                  style: TextStyle(
                                    color: Colors.white70,
                                    fontSize: 15,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  "Jackson Reed",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 22,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.notifications,
                              color: Colors.white),
                        ),

                      ],

                    ),

                    const SizedBox(height: 10),

                    const Text(
                      "Welcome to\nSmart Garden AI",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 35,
                        fontWeight: FontWeight.bold,
                        height: 1.0, // Slightly increased line spacing
                      ),
                    ),

                    const SizedBox(height: 30),

                    Center(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            margin: const EdgeInsets.symmetric(horizontal: 5),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.22),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withOpacity(0.25)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.08),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const _HeaderStat(title: "Area", value: "5 Acres"),
                          ),
                          Container(
                            padding: const EdgeInsets.all(12),
                            margin: const EdgeInsets.symmetric(horizontal: 5),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.22),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withOpacity(0.25)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.08),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const _HeaderStat(title: "Yield", value: "12 Tons"),
                          ),
                          Container(
                            padding: const EdgeInsets.all(12),
                            margin: const EdgeInsets.symmetric(horizontal: 5),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.22),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withOpacity(0.25)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.08),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const _HeaderStat(title: "Plant Age", value: "44 Days"),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// --------------------- Header Stat Widget -----------------------
class _HeaderStat extends StatelessWidget {
  final String title;
  final String value;

  const _HeaderStat({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style:
              const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

// ---------------- Farm Card -----------------
class _FarmCard extends StatelessWidget {
  final String name;
  final String location;
  final VoidCallback onTap;

  const _FarmCard({
    required this.name,
    required this.location,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.grey.shade100,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: ListTile(
        title: Text(name, style: const TextStyle(color: Colors.black)),
        subtitle:
            Text(location, style: const TextStyle(color: Colors.black54)),
        trailing: const Icon(Icons.arrow_forward_ios,
            color: Colors.black, size: 16),
        onTap: onTap,
      ),
    );
  }
}

// ---------------- Curved Header Clipper ----------------
class _HeaderCurveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.lineTo(0, size.height - 80);
    path.quadraticBezierTo(
        size.width / 2, size.height, size.width, size.height - 80);
    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
 