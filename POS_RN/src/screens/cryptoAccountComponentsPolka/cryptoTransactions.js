import React, { Component } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

function epsilonRound(num) {
  const zeros = 4;
  return (
    Math.round((num + Number.EPSILON) * Math.pow(10, zeros)) /
    Math.pow(10, zeros)
  );
}

class Ctransactions extends Component {
  render() {
    return (
      <ScrollView>
        {this.props.transactions.length > 0 ? (
          this.props.transactions.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                marginHorizontal: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ marginRight: 30 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      textAlign: "center",
                      color: "white",
                    }}
                  >
                    Block #{"\n"}
                    {item.block_num}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      textAlign: "center",
                      color: "white",
                    }}
                  >
                    Amount {"\n"}
                    {
                      <Text
                        style={{
                          color:
                            item.from.toLowerCase() !==
                            this.props.from.toLowerCase()
                              ? "#009900"
                              : "#990000",
                        }}
                      >
                        {item.amount}
                      </Text>
                    }
                    {"  "}
                    {item.asset_symbol}
                  </Text>
                </View>
                <View style={{ marginLeft: 30 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      textAlign: "center",
                      color: "white",
                    }}
                  >
                    Network {"\n"}
                    {item.network}
                  </Text>
                </View>
              </View>
              <View style={{ width: "100%", alignSelf: "center" }}>
                <Pressable
                  onPress={() =>
                    Linking.openURL(`${item.explorer}/tx/` + item.hash)
                  }
                >
                  <Text
                    style={{
                      color: "#0000FFAA",
                      textAlign: "center",
                      fontSize: 17,
                      textDecorationLine: "underline",
                    }}
                  >
                    {item.hash}
                  </Text>
                </Pressable>
              </View>
              <View
                style={{
                  backgroundColor: "#78d64b55",
                  height: 1,
                  width: "90%",
                  marginVertical: 20,
                  alignSelf: "center",
                }}
              />
            </View>
          ))
        ) : (
          <Text
            style={{ fontSize: 26, textAlign: "center", color: "#aaaaaa33" }}
          >
            No transactions yet...
          </Text>
        )}
      </ScrollView>
    );
  }
}

export default Ctransactions;
