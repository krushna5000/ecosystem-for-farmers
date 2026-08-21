import 'package:flutter/material.dart';
import 'farm_form.dart';

class AddFarmScreen extends StatelessWidget {
  const AddFarmScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Controllers for form fields
    final nameController = TextEditingController();
    final areaController = TextEditingController();
    final locationController = TextEditingController();
    final cropController = TextEditingController();

    bool isLoading = false; // Placeholder for loading state

    return Scaffold(
      appBar: AppBar(
        title: const Text("Add Farm"),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: FarmForm(
          nameController: nameController,
          areaController: areaController,
          locationController: locationController,
          cropController: cropController,
          isLoading: isLoading,
          onSave: () {
            // Placeholder for save action
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text("Save Farm clicked")),
            );
          },
        ),
      ),
    );
  }
}
