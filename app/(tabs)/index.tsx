import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { read, utils } from 'xlsx';

export default function HomeScreen() {
  const [excelData, setExcelData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      if (result.assets && result.assets[0]) {
        const { uri } = result.assets[0];
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const workbook = read(base64, { type: 'base64' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = utils.sheet_to_json(worksheet);
        
        if (data.length > 0) {
          setHeaders(Object.keys(data[0] as object));
          setExcelData(data);
        }
      }
    } catch (error) {
      console.error('Excel okuma hatası:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickDocument}>
        <Text style={styles.buttonText}>Excel Dosyası Seç</Text>
      </TouchableOpacity>

      {headers.length > 0 && (
        <ScrollView horizontal>
          <ScrollView style={styles.dataContainer}>
            {/* Tablo Başlıkları */}
            <View style={styles.headerRow}>
              {headers.map((header, index) => (
                <View key={index} style={styles.headerCell}>
                  <Text style={styles.headerText}>{header}</Text>
                </View>
              ))}
            </View>

            {/* Tablo Verileri */}
            {excelData.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {headers.map((header, colIndex) => (
                  <View key={colIndex} style={styles.cell}>
                    <Text style={styles.cellText}>
                      {row[header]?.toString() || ''}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dataContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    minWidth: 120,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    minWidth: 120,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  cellText: {
    fontSize: 14,
  },
});
