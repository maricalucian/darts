import { doc, getDoc } from "firebase/firestore";
import { db } from "../core/firebase";
import { TStat } from "../types";

export const getPlayerStats = async (
  compId: string,
  uid: string
): Promise<TStat> => {
  return await getDoc(doc(db, `competitions/${compId}/stats/${uid}`)).then(
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data as TStat;
      } else {
        return {} as TStat;
      }
    }
  );
};
