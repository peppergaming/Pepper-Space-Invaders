import Ship from "@/game/Ship";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthConfig } from "@/services/auth";
import { Contract } from "@ethersproject/contracts";
import { ethers } from "ethers";
import {
  DEFAULT_SHIP,
  PEPPER_SHIPS_CONTRACT_ADDRESS,
} from "@/config/constants";
import ContractAbi from "@/assets/web3/contract_abi.json";

export interface GameConfigContextInterface {
  ships: Ship[];
  selectedShip: Ship;
  selectShip: (ship: Ship) => void;
  refreshShips: () => Promise<void>;
}

export const GameConfigContext = createContext<GameConfigContextInterface>({
  ships: [],
  selectedShip: DEFAULT_SHIP,
  selectShip: () => {},
  refreshShips: async () => {},
});

export const useGameConfig = () => useContext(GameConfigContext);

export const GameConfigService = ({ children }: any) => {
  const [ships, setShips] = useState<Ship[]>([]);
  const [selectedShip, setSelectedShip] = useState<Ship>(DEFAULT_SHIP);
  const [contract, setContract] = useState<Contract>();
  const { provider, userInfo } = useAuthConfig();

  const refreshShips = async () => {
    if (contract && userInfo) {
      const userTokens = await contract.walletOfOwner(userInfo?.publicAddress);
      const shipsFound = [];
      for (const userToken of userTokens) {
        try {
          let tokenID = userToken.toNumber();
          const tokenURI = await contract.tokenURI(tokenID);
          const tokenDataResponse = await fetch(tokenURI);
          const tokenData = await tokenDataResponse.json();
          const attributes = tokenData?.attributes.reduce(
            (map: any, obj: any) => {
              map[obj.trait_type.toLowerCase()] = obj.value.toLowerCase();
              return map;
            },
            {}
          );

          const ship = new Ship(
            tokenData.name,
            tokenData.edition,
            tokenData.image,
            attributes
          );
          shipsFound.push(ship);
        } catch (e) {
          console.error(e);
        }
      }
      setShips(shipsFound);
    }
  };

  useEffect(() => {
    if (provider && !contract) {
      const contract = new ethers.Contract(
        PEPPER_SHIPS_CONTRACT_ADDRESS,
        ContractAbi,
        provider
      );
      setContract(contract);
    } else {
      setContract(undefined);
    }
  }, [provider]);

  useEffect(() => {
    if (contract && userInfo) {
      refreshShips();
    }
  }, [contract, userInfo]);

  const contextProvider = {
    ships,
    selectedShip,
    selectShip: setSelectedShip,
    refreshShips,
  };

  return (
    <GameConfigContext.Provider value={contextProvider}>
      {children}
    </GameConfigContext.Provider>
  );
};
