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
  TRoundPlayer,
  TRoundPlayerList,
  TRoundResult,
  TRoundResults,
  TStanding,
  TStandings,
  TTeams,
} from "../types";
import { API_ENDPOINT } from "../core/constants";

const localComp = localStorage.getItem("competition");
const tournament = localComp || "funday23";

console.log(tournament);

export const startNewRound = async (teams: boolean = false) => {
  const currentRound = await getCurrentRoundIndex();
  const newRound = currentRound + 1;
  const newRoundRef = doc(db, `competitions/${tournament}/rounds/${newRound}`);

  try {
    await getDoc(
      doc(db, `competitions/${tournament}/rounds/${currentRound}`)
    ).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status !== "completed") {
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
      type: teams ? "teams" : "",
      status: "registering",
    });
    await setDoc(
      doc(db, "competitions", tournament),
      {
        currentRound: newRound,
      },
      { merge: true }
    );
  } catch (e) {
    console.error(e);
  }
};

export const getCurrentRound = async (): Promise<FirestoreRound> => {
  const currentRoundIndex = await getCurrentRoundIndex();
  const roundRef = doc(
    db,
    `competitions/${tournament}/rounds/${currentRoundIndex}`
  );
  return getDoc(roundRef).then((docSnap) => {
    if (!docSnap.exists()) {
      throw new Error("Round not found");
    }
    return docSnap.data() as FirestoreRound;
  });
};

export const getRoundAndPlayers = async (roundIndex: number): Promise<any> => {
  return Promise.all([getRound(roundIndex), getRoundPlayers(roundIndex)]);
};

export const getRound = async (roundIndex: number): Promise<FirestoreRound> => {
  const roundRef = doc(db, `competitions/${tournament}/rounds/${roundIndex}`);
  return getDoc(roundRef).then((docSnap) => {
    if (!docSnap.exists()) {
      throw new Error("Round not found");
    }
    return docSnap.data() as FirestoreRound;
  });
};

export const subscribeToRound = (roundIndex: number, callback: any) => {
  const roundRef = doc(db, `competitions/${tournament}/rounds/${roundIndex}`);
  return onSnapshot(roundRef, (docRef) => {
    if (docRef.exists()) {
      const data = docRef.data();
      data.round = docRef.id;
      callback(data as FirestoreRound);
    } else {
      callback({} as FirestoreRound);
    }
  });
};

export const getCurrentRoundIndex = () => {
  return getDoc(doc(db, "competitions", tournament)).then((docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.currentRound;
    }
    return 0;
  });
};

export const getCompetition = (getTurn = "") => {
  const turn = getTurn ? getTurn : tournament;
  return getDoc(doc(db, "competitions", turn)).then((docSnap) => {
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return {};
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
    collection(db, `competitions/${tournament}/rounds/${roundIndex}/players`),
    (snapshot) => {
      const players: TRoundPlayerList = {};
      snapshot.forEach((doc) => {
        players[doc.id] = doc.data() as TRoundPlayer;
      });
      callback(players);
    }
  );
};

// returns rounds teams
export const subscribeToRoundTeams = (roundIndex: number, callback: any) => {
  return onSnapshot(
    collection(db, `competitions/${tournament}/rounds/${roundIndex}/teams`),
    (snapshot) => {
      const teams: TTeams = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        teams[doc.id] = {
          p1: data?.p1,
          p2: data?.p2,
        };
      });
      callback(teams);
    }
  );
};

// return an map of players
export const getRoundPlayers = async (roundIndex: number) => {
  const players: TRoundPlayerList = {};
  const querySnapshot = await getDocs(
    collection(db, `competitions/${tournament}/rounds/${roundIndex}/players`)
  );
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    players[doc.id] = doc.data() as TRoundPlayer;
  });

  return players;
};

// return an map of teams
export const getRoundTeams = async (roundIndex: number) => {
  const teams: TTeams = {};
  const querySnapshot = await getDocs(
    collection(db, `competitions/${tournament}/rounds/${roundIndex}/teams`)
  );
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    teams[doc.id] = {
      p1: data?.p1,
      p2: data?.p2,
    };
  });

  return teams;
};

export const addPlayerToRound = (roundIndex: number, playerId: string) => {
  return setDoc(
    doc(
      db,
      `competitions/${tournament}/rounds/${roundIndex}/players/${playerId}`
    ),
    {
      addedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const createRoundTeam = async (
  roundIndex: number,
  p1Id: string,
  p2Id: string
) => {
  await addPlayerToRound(roundIndex, p1Id);
  return setDoc(
    doc(db, `competitions/${tournament}/rounds/${roundIndex}/teams/${p1Id}`),
    {
      p1: p1Id,
      p2: p2Id,
      createdAt: serverTimestamp(),
    }
  );
};

export const removeRoundPlayer = (roundIndex: number, playerId: string) => {
  return deleteDoc(
    doc(
      db,
      `competitions/${tournament}/rounds/${roundIndex}/players/${playerId}`
    )
  );
};

export const disbandTeam = async (roundIndex: number, teamId: string) => {
  await deleteDoc(
    doc(db, `competitions/${tournament}/rounds/${roundIndex}/players/${teamId}`)
  );
  return deleteDoc(
    doc(db, `competitions/${tournament}/rounds/${roundIndex}/teams/${teamId}`)
  );
};

export const deleteAllRoundResults = async (roundIndex: number) => {
  const querySnapshot = await getDocs(
    collection(db, `/competitions/${tournament}/rounds/${roundIndex}/players`)
  );
  querySnapshot.forEach((d) => {
    // doc.data() is never undefined for query doc snapshots
    setDoc(
      doc(
        db,
        `/competitions/${tournament}/rounds/${roundIndex}/players/${d.id}`
      ),
      {
        paid: (d.data() && d.data().paid) || "",
      }
    );
  });
};

export const deleteAllMatches = async (roundIndex: number) => {
  const querySnapshot = await getDocs(
    collection(db, `/competitions/${tournament}/rounds/${roundIndex}/matches`)
  );
  querySnapshot.forEach((d) => {
    // doc.data() is never undefined for query doc snapshots
    deleteDoc(
      doc(
        db,
        `/competitions/${tournament}/rounds/${roundIndex}/matches/${d.id}`
      )
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
        `competitions/${tournament}/rounds/${roundIndex}/matches/${match.number}`
      ),
      match
    );
  });

  await batch.commit();

  const coll = collection(
    db,
    `competitions/${tournament}/rounds/${roundIndex}/players`
  );
  const snapshot = await getCountFromServer(coll);

  await setDoc(
    doc(db, `competitions/${tournament}/rounds/${roundIndex}`),
    {
      status: "running",
      totalPlayers: snapshot.data().count,
    },
    { merge: true }
  );
};

export const updateRoundInfo = (round: FirestoreRound, info: any) => {
  return setDoc(
    doc(db, `competitions/${tournament}/rounds/${round.round}`),
    info,
    { merge: true }
  );
};

export const setRoundStatus = async (roundIndex: number, status: string) => {
  return await setDoc(
    doc(db, `competitions/${tournament}/rounds/${roundIndex}`),
    {
      status: status,
    },
    { merge: true }
  );
};

// returns rounds players uid
export const subscribeToRoundMatches = (roundIndex: number, callback: any) => {
  return onSnapshot(
    collection(db, `competitions/${tournament}/rounds/${roundIndex}/matches`),
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
      `competitions/${tournament}/rounds/${roundIndex}/matches/${matchNumber}`
    ),
    results,
    { merge: true }
  );

  fetch(`${API_ENDPOINT}/updateStats?tournament=${tournament}`);
  // todo remove this
  // processCompetition(roundIndex);
};

export const updateUsersPlayer = async (userId: string, playerId: string) => {
  if (playerId === "XXNONE") {
    await setDoc(doc(db, `users/${userId}`), {
      playerId: "",
    });

    // await setDoc(
    //   doc(db, `players/${playerId}`),
    //   {
    //     userId: "",
    //   },
    //   { merge: true }
    // );
  } else {
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
  }
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

export const setPlayerPaid = (
  roundIndex: number,
  playerId: string,
  paid: boolean
) => {
  return setDoc(
    doc(
      db,
      `competitions/${tournament}/rounds/${roundIndex}/players/${playerId}`
    ),
    {
      paid: paid,
    },
    { merge: true }
  );
};

export const getStandings = async (compId: string) => {
  const standings: TStandings = {};
  const querySnapshot = await getDocs(
    collection(db, `competitions/${compId}/standings`)
  );
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    standings[doc.id] = doc.data() as TStanding;
  });

  return standings;
};

export const getplayerStandings = async (compId: string, uid: string) => {
  const standings: TStandings = {};
  return await getDoc(doc(db, `competitions/${compId}/standings/${uid}`)).then(
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data as TStanding;
      } else {
        return {} as TStanding;
      }
    }
  );
};

export const getStandingsAfterRound = async (
  compId: string,
  roundIndex: number
) => {
  const standings: TStandings = {};
  const querySnapshot = await getDocs(
    collection(db, `competitions/${compId}/rounds/${roundIndex}/standings`)
  );
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    standings[doc.id] = doc.data() as TStanding;
  });

  return standings;
};
