import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class FarmForm extends StatelessWidget {
  final TextEditingController nameController;
  final TextEditingController areaController;
  final TextEditingController locationController;
  final TextEditingController cropController;
  final VoidCallback onSave;
  final bool isLoading;

  const FarmForm({
    super.key,
    required this.nameController,
    required this.areaController,
    required this.locationController,
    required this.cropController,
    required this.onSave,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.white, Colors.green.shade50],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.agriculture,
                      size: 80,
                      color: Colors.green.shade600,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      "Add New Farm",
                      style: GoogleFonts.poppins(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.green.shade800,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Fill in the details below to add your farm",
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),

              // Form Fields
              _buildTextField(
                controller: nameController,
                label: "Farm Name",
                icon: Icons.home,
                hint: "Enter farm name",
              ),
              const SizedBox(height: 20),
              _buildTextField(
                controller: areaController,
                label: "Area (m²)",
                icon: Icons.straighten,
                hint: "Enter area in square meters",
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 20),
              _buildTextField(
                controller: locationController,
                label: "Location",
                icon: Icons.location_on,
                hint: "Enter farm location",
              ),
              const SizedBox(height: 20),
              _buildTextField(
                controller: cropController,
                label: "Crop Type (optional)",
                icon: Icons.grass,
                hint: "e.g., Wheat, Rice, Corn",
              ),

              const SizedBox(height: 40),

              // Save Button
              isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : Container(
                      width: double.infinity,
                      height: 60,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.green.shade500, Colors.green.shade700],
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.green.withOpacity(0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        onPressed: onSave,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: Text(
                          "Save Farm",
                          style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          prefixIcon: Icon(icon, color: Colors.green.shade600),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          labelStyle: GoogleFonts.poppins(
            color: Colors.grey.shade600,
            fontSize: 16,
          ),
          hintStyle: GoogleFonts.poppins(
            color: Colors.grey.shade400,
            fontSize: 14,
          ),
        ),
        style: GoogleFonts.poppins(
          fontSize: 16,
          color: Colors.black87,
        ),
      ),
    );
  }
}
