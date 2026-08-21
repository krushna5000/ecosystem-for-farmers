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
    return SingleChildScrollView(
      child: Column(
        children: [
          TextField(
            controller: nameController,
            decoration: InputDecoration(
              labelText: "Farm Name",
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: areaController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: "Area (m²)",
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: locationController,
            decoration: InputDecoration(
              labelText: "Location",
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: cropController,
            decoration: InputDecoration(
              labelText: "Crop Type (optional)",
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 20),
          isLoading
              ? const CircularProgressIndicator()
              : SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: onSave,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF84A923), // Primary Green
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      "Save Farm",
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
        ],
      ),
    );
  }
}
