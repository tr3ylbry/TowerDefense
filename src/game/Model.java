package game;

import java.util.ArrayList;
import java.util.List;
import java.util.Observable;

import ammo.Ammo;
import characters.*;
import characters.Aliens.Enemy;
import characters.Astronauts.DefenderTower;
import map.Tile;

public class Model extends Observable {
	// Class fields
	private Tile[][] board;
	// TODO: add list of defenders to be able to iterate while animating?? Maybe not necessary of checking with row, col from alien.
	private int bank;
	private int currentWave;
	private List<Enemy> aliens;
	private List<Ammo> bullets;
	private List<DefenderTower> towers;
	// TODO: Create list of money trees, and every time one is added, start a timeline to add currency
	
	// Constructor
	public Model () {
		towers = new ArrayList<DefenderTower>();
		bullets = new ArrayList<Ammo>();
		bank = 0;
		currentWave = 1;
		aliens = new ArrayList<Enemy>();
		board = new Tile[Controller.ROWS][Controller.COLS];
		initializeBoard();
	}
	
	public void addBullet(Ammo bullet) {
		bullets.add(bullet);
		
		MoveMessage message = new MoveMessage(MoveMessage.BULLET_PLACEMENT);
		message.setBullet(bullet);
		
		setChanged();
		notifyObservers(message);
	}
	
	public void removeBullet(Ammo bullet) {
		bullets.remove(bullet);
		
		MoveMessage message = new MoveMessage(MoveMessage.BULLET_REMOVAL);
		message.setBullet(bullet);
		
		setChanged();
		notifyObservers(message);
	}
	
	public List<DefenderTower> getTowers() {
		return towers;
	}
	
	public List<Ammo> getBullets() {
		return this.bullets;
	}
	
	public void setWaveNumber(int waveNumber) {
		this.currentWave = waveNumber;
	}
	
	public void addAlien(Enemy alien) {
		aliens.add(alien);
	}
	
	public void removeAlien(Enemy alien) {
		aliens.remove(alien);
		MoveMessage message = new MoveMessage(MoveMessage.VALID_MOVE, alien, 0, 0, true);
		setChanged();
		notifyObservers(message);
	}
	
	public List<Enemy> getAliens() {
		return aliens;
	}
	
	public boolean hasAliens() {
		return !aliens.isEmpty();
	}
	
	public int getWaveNumber() {
		return currentWave;
	}
	
	// Methods
	public void initializeBoard() {
		for (int row = 0; row < Controller.ROWS; row++) {
			for (int col = 0; col < Controller.COLS; col++) {
				board[row][col] = new Tile(null); // Initialize empty tile
				if (col == 0) {
					board[row][col].setRailGun(true);
				}
			}
		}
	}
	
	
	public boolean isEmpty(int row, int col) {
		return board[row][col].isEmpty();
	}
	
	public Tile[][] getBoard() {
		return board;
	}
	
	public int getSpacebucks() {
		return bank;
	}
	
	public void placeCharacter(BoardCharacter character, int row, int col) {
		MoveMessage message = null;
		// Adjust bank amount
		if (character instanceof DefenderTower) {
			towers.add((DefenderTower)character);
			bank -= ((DefenderTower)character).getCost();
			
			// Place character
			character.setRow(row);
			character.setCol(col);
			board[row][col].placeCharacter(character);
			
			// Creating message to send to view
			message = new MoveMessage(MoveMessage.VALID_MOVE, (DefenderTower)character, row, col, false);
		} else if (character instanceof Enemy) {
			message = new MoveMessage(MoveMessage.VALID_MOVE, (Enemy)character, row, col, false);
		}
		
		// Notify Observers
		setChanged();
		notifyObservers(message);
	}
	
	public void depositSpacebucks(int amount) {
		bank += amount;
		setChanged();
		notifyObservers();
	}
	
	public void notifyInvalidPlacement() {
		MoveMessage message = new MoveMessage(MoveMessage.INVALID_MOVE);
		setChanged();
		notifyObservers(message);
	}
	
	public void notifyInsufficientFunds() {
		MoveMessage message = new MoveMessage(MoveMessage.INSUFFICIENT_FUNDS);
		setChanged();
		notifyObservers(message);
	}

	public void removeTower(DefenderTower towerToRemove, int row, int col) {
		towers.remove(towerToRemove);
		// adjusts bank amount
		bank += DefenderTower.REFUND_MULTIPLIER * towerToRemove.getCost();
		
		board[row][col] = new Tile(null);
		
		// Creating message to send to view
		MoveMessage message = new MoveMessage(MoveMessage.VALID_MOVE, towerToRemove, row, col, true);
		
		setChanged();
		notifyObservers(message);
	}

	public DefenderTower getDefenderAt(int row, int col) {
		return (DefenderTower) board[row][col].getCharacter();
	}
	
	public void activateRailGun(int row, int col) {
		board[row][col].setRailGun(false);
		
		// Create MoveMessage notifying View to activate RailGun animation
		MoveMessage message = new MoveMessage(MoveMessage.ACTIVATE_RAILGUN, null, row, col, false);
		
		// Compile list of all aliens that need to be removed
		List<Enemy> aliensToRemove = new ArrayList<Enemy>();
		for (Enemy alien : aliens) {
			if (alien.getRow() == row) {
				aliensToRemove.add(alien);
			}
		}
		message.setAliens(aliensToRemove);
		
		setChanged();
		notifyObservers(message);
	}
}
