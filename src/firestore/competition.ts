import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../core/firebase";
import {
  Competition,
  FirestoreRound,
  Match,
  TPlayer,
  TPlayersList,
  TResults,
  TRoundPlayerList,
  TRoundResult,
  TRoundResults,
} from "../types";
import { BLANK } from "../core/constants";
import {
  getNextMatchOrder,
  getProcessedCompetition,
} from "../core/competition";

export const startNewRound = async () => {
  const currentRound = await getCurrentRoundIndex();
  const newRound = currentRound + 1;
  const newRoundRef = doc(db, `competitions/duminica23/rounds/${newRound}`);

  try {
    await getDoc(
      doc(db, `competitions/duminica23/rounds/${currentRound}`)
    ).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status !== "finished") {
          alert("Please complete previous round before starting another");
          throw new Error("Previous round not completed");
        }
      }
    });

    await getDoc(newRoundRef).then((docSnap) => {
      if (docSnap.exists()) {
        alert(`Round ${newRound} already exists`);
        throw new Error("Round already exists");
      }
    });
    await setDoc(newRoundRef, {
      round: newRound,
      status: "registering",
    });
    await setDoc(doc(db, "competitions", "duminica23"), {
      currentRound: newRound,
    });
  } catch (e) {
    console.error(e);
  }
};

export const getCurrentRound = async (): Promise<FirestoreRound> => {
  const currentRoundIndex = await getCurrentRoundIndex();
  const roundRef = doc(
    db,
    `competitions/duminica23/rounds/${currentRoundIndex}`
  );
  return getDoc(roundRef).then((docSnap) => {
    if (!docSnap.exists()) {
      throw new Error("Round already exists");
    }
    return docSnap.data() as FirestoreRound;
  });
};

export const subscribeToRound = (roundIndex: number, callback: any) => {
  const roundRef = doc(db, `competitions/duminica23/rounds/${roundIndex}`);
  return onSnapshot(roundRef, (docRef) => {
    if (docRef.exists()) {
      const data = docRef.data();
      callback(data as FirestoreRound);
    }
  });
};

export const getCurrentRoundIndex = () => {
  return getDoc(doc(db, "competitions", "duminica23")).then((docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.currentRound;
    }
    return 0;
  });
};

export const addPlayer = (playerName: string) => {
  return addDoc(collection(db, "players"), {
    name: playerName,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToAllPlayers = (callback: any) => {
  return onSnapshot(collection(db, "players"), (snapshot) => {
    const players: TPlayersList = {};
    snapshot.forEach((doc) => {
      players[doc.id] = doc.data() as TPlayer;
    });
    callback(players);
  });
};

// returns rounds players uid
export const subscribeToRoundPlayers = (roundIndex: number, callback: any) => {
  return onSnapshot(
    collection(db, `competitions/duminica23/rounds/${roundIndex}/players`),
    (snapshot) => {
      const players: string[] = [];
      snapshot.forEach((doc) => {
        players.push(doc.id);
      });
      callback(players);
    }
  );
};

// return an map of players
export const getRoundPlayers = async (roundIndex: number) => {
  const players: TRoundPlayerList = {};
  const querySnapshot = await getDocs(
    collection(db, `competitions/duminica23/rounds/${roundIndex}/players`)
  );
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    players[doc.id] = {
      uid: doc.id,
    };
  });

  return players;
};

export const addPlayerToRound = (roundIndex: number, playerId: string) => {
  return setDoc(
    doc(db, `competitions/duminica23/rounds/${roundIndex}/players/${playerId}`),
    {
      addedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const removeRoundPlayer = (roundIndex: number, playerId: string) => {
  return deleteDoc(
    doc(db, `competitions/duminica23/rounds/${roundIndex}/players/${playerId}`)
  );
};

export const deleteAllRoundResults = async (roundIndex: number) => {
  const querySnapshot = await getDocs(
    collection(db, `/competitions/duminica23/rounds/${roundIndex}/results`)
  );
  querySnapshot.forEach((d) => {
    // doc.data() is never undefined for query doc snapshots
    deleteDoc(
      doc(db, `/competitions/duminica23/rounds/${roundIndex}/results/${d.id}`)
    );
  });
};

export const deleteAllMatches = async (roundIndex: number) => {
  const querySnapshot = await getDocs(
    collection(db, `/competitions/duminica23/rounds/${roundIndex}/matches`)
  );
  querySnapshot.forEach((d) => {
    // doc.data() is never undefined for query doc snapshots
    deleteDoc(
      doc(db, `/competitions/duminica23/rounds/${roundIndex}/matches/${d.id}`)
    );
  });
};

export const startCompetition = async (
  roundIndex: number,
  competition: Competition
) => {
  // write all games to firestore

  const batch = writeBatch(db);
  Object.values(competition).forEach((match) => {
    batch.set(
      doc(
        db,
        `competitions/duminica23/rounds/${roundIndex}/matches/${match.number}`
      ),
      match
    );
  });

  await batch.commit();

  const coll = collection(
    db,
    `competitions/duminica23/rounds/${roundIndex}/players`
  );
  const snapshot = await getCountFromServer(coll);

  await setDoc(
    doc(db, `competitions/duminica23/rounds/${roundIndex}`),
    {
      status: "running",
      totalPlayers: snapshot.data().count,
    },
    { merge: true }
  );
};

export const setRoundStatus = async (roundIndex: number, status: string) => {
  return await setDoc(
    doc(db, `competitions/duminica23/rounds/${roundIndex}`),
    {
      status: status,
    },
    { merge: true }
  );
}

export const processCompetition = async (roundIndex: number) => {
  return;

  const competition: Competition = {};
  const querySnapshot = await getDocs(
    collection(db, `competitions/duminica23/rounds/${roundIndex}/matches`)
  );
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    competition[parseInt(doc.id)] = doc.data() as Match;
  });

  const processedCompetition: Competition =
    getProcessedCompetition(competition);

  const batch = writeBatch(db);
  Object.values(processedCompetition).forEach((match) => {
    batch.set(
      doc(
        db,
        `competitions/duminica23/rounds/${roundIndex}/matches/${match.number}`
      ),
      match
    );
  });

  await batch.commit();
};

// returns rounds players uid
export const subscribeToRoundMatches = (roundIndex: number, callback: any) => {
  return onSnapshot(
    collection(db, `competitions/duminica23/rounds/${roundIndex}/matches`),
    (snapshot) => {
      const competition: Competition = {};
      snapshot.forEach((doc) => {
        competition[parseInt(doc.id)] = doc.data() as Match;
      });
      callback(competition);
    }
  );
};

export const updateMatchResult = async (
  roundIndex: number,
  matchNumber: number,
  results: TResults
) => {
  await setDoc(
    doc(
      db,
      `competitions/duminica23/rounds/${roundIndex}/matches/${matchNumber}`
    ),
    results,
    { merge: true }
  );
  // todo remove this
  // processCompetition(roundIndex);
};

export const updateUsersPlayer = async (userId: string, playerId: string) => {
  await setDoc(doc(db, `users/${userId}`), {
    playerId: playerId,
  });

  await setDoc(
    doc(db, `players/${playerId}`),
    {
      userId: userId,
    },
    { merge: true }
  );
};

export const subscribeToUsersMap = (callback: any) => {
  return onSnapshot(collection(db, `users`), (snapshot) => {
    const usersMap: { [key: string]: string } = {};
    snapshot.forEach((d) => {
      usersMap[d.id] = d.data().playerId;
    });
    callback(usersMap);
  });
};
export const subscribeToResults = (roundIndex: number, callback: any) => {
  return onSnapshot(
    collection(db, `competitions/duminica23/rounds/${roundIndex}/results`),
    (snapshot) => {
      const roundResults: TRoundResults = {};
      snapshot.forEach((d) => {
        roundResults[d.id] = d.data() as TRoundResult;
      });
      callback(roundResults);
    }
  );
};
