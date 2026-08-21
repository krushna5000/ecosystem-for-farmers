import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class CropLifeCycleScreen extends StatefulWidget {
  const CropLifeCycleScreen({super.key});

  @override
  State<CropLifeCycleScreen> createState() => _CropLifeCycleScreenState();
}

class _CropLifeCycleScreenState extends State<CropLifeCycleScreen> {
  final TextEditingController cropController = TextEditingController(text: "Rice");
  DateTime? plantedDate;

  int daysCompleted = 0;
  String currentStage = "";
  int remainingDays = 0;
  String nextStage = "";

  // Example crop stages (in days)
  final int germinationDays = 7;
  final int vegetativeDays = 14;
  final int floweringDays = 10;
  final int fruitingDays = 7;

  void calculateCropLifeCycle() {
    if (plantedDate == null) return;

    daysCompleted = DateTime.now().difference(plantedDate!).inDays;

    int g = germinationDays;
    int v = g + vegetativeDays;
    int f = v + floweringDays;
    int fr = f + fruitingDays;

    if (daysCompleted <= g) {
      currentStage = "Germination";
      remainingDays = g - daysCompleted;
      nextStage = "Vegetative";
    } else if (daysCompleted <= v) {
      currentStage = "Vegetative";
      remainingDays = v - daysCompleted;
      nextStage = "Flowering";
    } else if (daysCompleted <= f) {
      currentStage = "Flowering";
      remainingDays = f - daysCompleted;
      nextStage = "Fruiting";
    } else if (daysCompleted <= fr) {
      currentStage = "Fruiting";
      remainingDays = fr - daysCompleted;
      nextStage = "Harvesting";
    } else {
      currentStage = "Harvesting";
      remainingDays = 0;
      nextStage = "Crop Ready!";
    }

    setState(() {});
  }

  Future<void> pickDate(BuildContext context) async {
    DateTime? date = await showDatePicker(
      context: context,
      initialDate: plantedDate ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (date != null) {
      setState(() {
        plantedDate = date;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Crop Life Cycle Calculator"),
        backgroundColor: Colors.green,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Crop Input & Planting Date
            Card(
              elevation: 3,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    TextField(
                      controller: cropController,
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.agriculture),
                        labelText: "Crop Name",
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () => pickDate(context),
                      icon: const Icon(Icons.calendar_today),
                      label: Text(plantedDate != null
                          ? "Planted: ${DateFormat('d/M/yyyy').format(plantedDate!)}"
                          : "Select Planting Date"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: calculateCropLifeCycle,
                      child: const Text("Calculate"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Result Card
            if (currentStage.isNotEmpty)
              Card(
                color: Colors.green[50],
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "🌱 Crop: ${cropController.text}",
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.calendar_month, size: 18),
                          const SizedBox(width: 8),
                          Text("Days Completed: $daysCompleted"),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.flag, size: 18),
                          const SizedBox(width: 8),
                          Text("Current Stage: $currentStage"),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.hourglass_bottom, size: 18),
                          const SizedBox(width: 8),
                          Text("Remaining Days: $remainingDays"),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.arrow_forward, size: 18),
                          const SizedBox(width: 8),
                          Text("Next Stage: $nextStage"),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
