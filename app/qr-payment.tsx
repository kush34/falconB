import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { X, CircleCheck as CheckCircle, IndianRupee } from 'lucide-react-native';

// ✅ Import the local QR image
const qrImage = require('@/assets/images/qr-code.png');

export default function QRPaymentScreen() {``
  const { amount } = useLocalSearchParams<{ amount: string }>();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [image,setImage] = useState<string>();
  const [transactionId,setTransactionId] = useState<string>("");
  const handlePaymentMade = async () => {
  if (!user || !amount || !transactionId) return;

  setProcessing(true);

  try {
    const depositAmount = parseFloat(amount);
    // ✅ Insert a ticket for manual verification
    const { error: ticketError } = await supabase
    .from('tickets') // or 'balance_requests'
    .insert([
      {
        amount: depositAmount,
        type: 'Deposit',
        ticket_status: 'pending', // default status
        transaction_id:transactionId
        // user_id: user.id, // OR leave this out if using trigger
      }
    ]);
    console.log(depositAmount);

    if (ticketError) throw ticketError;

    Alert.alert(
      'Request Sent!',
      `₹${depositAmount.toLocaleString('en-IN')} deposit request has been submitted. It will be added to your balance after verification.`,
      [
        {
          text: 'OK',
          onPress: () => {
            router.dismissAll();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  } catch (error) {
    console.error('Ticket creation error:', error);
    Alert.alert(
      'Error',
      'There was a problem submitting your request. Please try again.',
      [{ text: 'OK' }]
    );
  } finally {
    setProcessing(false);
  }
};
const fetchImage = async () => {
  const { data, error } = await supabase
    .storage
    .from('images')
    .getPublicUrl('PaymentQR/qr-code.png');

  if (error || !data?.publicUrl) {
    console.log(" Error fetching image:", error?.message);
    return;
  }

  console.log("Fetched Image URL:", data.publicUrl);
  setImage(data.publicUrl);
};


  const handleClose = () => {
    router.back();
  };
  useEffect(()=>{
    fetchImage();
  },[])
  return (
    <ScrollView>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <View style={styles.amountRow}>
            <IndianRupee size={24} color="#007AFF" />
            <Text style={styles.amountText}>
              {parseFloat(amount || '0').toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="enter your transaction_id"
            value={transactionId}
            onChangeText={setTransactionId}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Scan QR Code to Pay</Text>
          <Text style={styles.qrSubtitle}>
            Use any UPI app to scan and complete the payment
          </Text>

          <View style={styles.qrContainer}>
            {image ? (
             <Image
              source={{ uri: `${image}?t=${Date.now()}` }} 
              style={styles.qrImage}
              resizeMode="contain"
            />

            ) : (
              <Text style={{ color: '#999' }}>Loading QR...</Text>
            )}

          </View>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Payment Instructions</Text>
            <Text style={styles.instructionText}>
              1. Open your UPI app (PhonePe, Google Pay, Paytm, etc.)
            </Text>
            <Text style={styles.instructionText}>
              2. Scan the QR code above
            </Text>
            <Text style={styles.instructionText}>
              3. Enter the amount: ₹{parseFloat(amount || '0').toLocaleString('en-IN')}
            </Text>
            <Text style={styles.instructionText}>
              4. Complete the payment
            </Text>
            <Text style={styles.instructionText}>
              5. Click "Payment Made" below
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.paymentButton, processing && styles.paymentButtonDisabled]}
          onPress={handlePaymentMade}
          disabled={processing}
        >
          <CheckCircle size={20} color="#fff" />
          <Text style={styles.paymentButtonText}>
            {processing ? 'Processing...' : 'Payment Made'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
    marginLeft: 4,
  },
  qrSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  instructionsCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  instructionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
    marginBottom: 4,
    lineHeight: 16,
  },
  paymentButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentButtonDisabled: {
    backgroundColor: '#C7C7CC',
    shadowOpacity: 0,
    elevation: 0,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
    inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  }
});
