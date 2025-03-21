import { db, collection, addDoc, query, where, getDocs } from "./firebase";

class MedicationService {
  // Add a medication for a user
  async addMedication(medication, userId) {
    try {
      const docRef = await addDoc(collection(db, 'medications'), {
        ...medication,
        userId: userId,
      });
      console.log("Medication added with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding medication: ", error);
    }
  }

  // Get medications for a user
  async getMedications(userId) {
    try {
      const medicationsRef = collection(db, 'medications');
      const q = query(medicationsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const medications = querySnapshot.docs.map(doc => doc.data());
      return medications;
    } catch (error) {
      console.error("Error retrieving medications: ", error);
      throw error;
    }
  }
}

export const medicationService = new MedicationService();
export default MedicationService; 