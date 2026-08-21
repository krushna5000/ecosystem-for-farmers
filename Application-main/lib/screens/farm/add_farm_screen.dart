import 'package:flutter/material.dart';
import 'farm_form.dart';

class AddFarmScreen extends StatefulWidget {
  const AddFarmScreen({super.key});

  @override
  State<AddFarmScreen> createState() => _AddFarmScreenState();
}

class _AddFarmScreenState extends State<AddFarmScreen> {
  // Controllers for form fields
  final nameController = TextEditingController();
  final areaController = TextEditingController();
  final locationController = TextEditingController();
  final cropController = TextEditingController();

  bool isLoading = false;

  @override
  void dispose() {
    nameController.dispose();
    areaController.dispose();
    locationController.dispose();
    cropController.dispose();
    super.dispose();
  }

  void _saveFarm() async {
    if (nameController.text.isEmpty || locationController.text.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Please fill in required fields")),
        );
      }
      return;
    }

    setState(() {
      isLoading = true;
    });

    // Simulate saving (replace with actual API call)
    await Future.delayed(const Duration(seconds: 1));

    final farmData = {
      "name": nameController.text,
      "location": locationController.text,
      "area": areaController.text,
      "crop": cropController.text,
    };

    setState(() {
      isLoading = false;
    });

    if (mounted) {
      Navigator.pop(context, farmData);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Add Farm"),
        centerTitle: true,
        backgroundColor: Colors.green.shade600,
        elevation: 0,
      ),
      body: FarmForm(
        nameController: nameController,
        areaController: areaController,
        locationController: locationController,
        cropController: cropController,
        isLoading: isLoading,
        onSave: _saveFarm,
      ),
    );
  }
}
