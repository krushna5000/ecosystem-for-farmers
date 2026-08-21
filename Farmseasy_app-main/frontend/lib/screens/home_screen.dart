import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final farms = [
      {"name": "Farm 1", "location": "Village A"},
      {"name": "Farm 2", "location": "Village B"},
    ];

    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: RefreshIndicator(
        onRefresh: () async {
          // Pull to refresh placeholder
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _WelcomeHeader(userName: "Aditi"),
              const SizedBox(height: 16),

              // Add Farm Row
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      "Your Farms",
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pushNamed(context, '/add-farm');
                      },
                      icon: const Icon(Icons.add),
                      label: const Text("Add Farm"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 3,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Farms List
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: farms.length,
                itemBuilder: (context, index) {
                  final f = farms[index];
                  return _FarmCard(
                    name: f["name"]!,
                    location: f["location"]!,
                    onTap: () {},
                  );
                },
              ),

              const SizedBox(height: 100), // spacing for FAB
            ],
          ),
        ),
      ),

      // Floating Action Button (Camera)
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Connect camera functionality here
        },
        backgroundColor: Colors.green,
        child: const Icon(Icons.camera_alt, size: 28),
        elevation: 6,
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,

      // Bottom Navigation Bar
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        notchMargin: 8,
        child: SizedBox(
          height: 60,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              IconButton(
                icon: const Icon(Icons.home),
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/home');
                },
              ),
              IconButton(
                icon: const Icon(Icons.favorite),
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/diagnosis');
                },
              ),
              const SizedBox(width: 48), // space for FAB
              IconButton(
                icon: const Icon(Icons.local_florist),
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/crop-care');
                },
              ),
              IconButton(
                icon: const Icon(Icons.person),
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/profile');
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ------------------- COMPONENTS -------------------

class _WelcomeHeader extends StatelessWidget {
  final String userName;
  const _WelcomeHeader({required this.userName});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(24, 40, 24, 32),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.green.shade700, Colors.green.shade400],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.green.shade200.withOpacity(0.4),
            offset: const Offset(0, 6),
            blurRadius: 12,
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Welcome, $userName 👋",
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "Manage your farms and crops",
            style: TextStyle(
              fontSize: 16,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }
}

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
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: ListTile(
        title: Text(
          name,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(location),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}
