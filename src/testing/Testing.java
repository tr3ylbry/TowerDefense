/**
 * @author Adrian Bao
 * @author Trey Bryant
 * @author Mauricio Herrera
 * @author Tim Lukau
 * 
 * CSC 335 - Object Oriented Programming and Design
 * 
 * Title: Astronauts vs Aliens
 * 
 * File: Testing.java
 * 
 * Description: test suite for AstronautsVsAliens game.
 * 
 */

package testing;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.junit.BeforeClass;
import org.junit.jupiter.api.Test;

import ammo.AstroJoeAmmo;
import ammo.ExplosiveAstroJoeAmmo;
import ammo.MoonZeusAmmo;
import ammo.StartrellClugginsAmmo;
import ammo.TarsAmmo;
import characters.Aliens.*;

import characters.Aliens.LittleGreenMen;
import characters.Astronauts.*;
import game.*;
import javafx.application.Application;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;

/**
 * This class runs the tests for AstronutsVsAliens
 * */
class Testing {
	
	private static Thread t;

	/**
	 * Mocks the initiation of graphics for testsing purposes
	 * */
	@BeforeClass
	public static void setUpClass() throws InterruptedException {
		// Initialise Java FX

		System.out.printf("About to launch FX App\n");
		t = new Thread("JavaFX Init Thread") {
			public void run() {
				Application.launch(View.class, new String[0]);
			}
		};
		t.setDaemon(true);
		t.start();
		System.out.printf("FX App thread started\n");
		Thread.sleep(500);
	}
	/**
	 * This method runs a suite of tests
	 * */
	@Test
	void Tests() throws InterruptedException {
		// Initialize the MVC
		setUpClass();
		Model testModel = new Model();
		Controller testController = new Controller(testModel);

		testController.initialize();

		// Place a character when broke
		testController.placeCharacter(new MillenniumFalcon(), 0, 0);
		assertTrue(testModel.isAvailable(0, 0));
		// Give the test bot enough money
		testModel.depositSpacebucks(10000);

		// Placing the characters on the board
		testController.placeCharacter(new StartrellCluggins(), 0, 0);
		testController.placeCharacter(new AstroJoe(), 0, 1);
		testController.placeCharacter(new MoonZeus(), 0, 2);
		testController.placeCharacter(new ExplosiveAstroJoe(), 0, 3);
		testController.placeCharacter(new Asteroid(), 0, 4);
		testController.placeCharacter(new MoneyBush(), 0, 5);
		testController.placeCharacter(new MillenniumFalcon(), 1, 0);
		testController.placeCharacter(new Tars(), 1, 1);
		testController.placeCharacter(new MoneyTree(), 1, 2);

		// Testing Defender detection
		assertTrue(testModel.getDefenderAt(0, 0) instanceof StartrellCluggins);
		assertFalse(testModel.isAvailable(0, 0));
		assertTrue(testModel.containsTower(0, 0));
		// StartrellCluggins coverage
		StartrellCluggins startrell = (StartrellCluggins) testModel.getDefenderAt(0, 0);
		startrell.shoot();
		assertTrue(startrell.canShoot());
		assertTrue(startrell.toString().startsWith("Startrell Cluggins"));

		// AstroJoe coverage
		AstroJoe astroJoe = (AstroJoe) testModel.getDefenderAt(0, 1);
		astroJoe.shoot();
		assertTrue(astroJoe.canShoot());
		assertTrue(astroJoe.toString().startsWith("Astro Joe"));

		// MoonZeus coverage
		MoonZeus zeus = (MoonZeus) testModel.getDefenderAt(0, 2);
		zeus.shoot();
		assertTrue(zeus.canShoot());
		assertTrue(zeus.toString().startsWith("Moon Zeus"));

		// ExplosiveAstroJoe coverage
		ExplosiveAstroJoe eAstroJoe = (ExplosiveAstroJoe) testModel.getDefenderAt(0, 3);
		eAstroJoe.shoot();
		assertTrue(eAstroJoe.canShoot());
		assertTrue(eAstroJoe.toString().startsWith("Explosive Astro Joe"));

		// Asteroid coverage
		Asteroid asteroid = (Asteroid) testModel.getDefenderAt(0, 4);
		asteroid.shoot();
		assertFalse(asteroid.canShoot());
		assertTrue(asteroid.toString().startsWith("Asteroid"));

		// MoneyBush coverage
		MoneyBush moneyBush = (MoneyBush) testModel.getDefenderAt(0, 5);
		moneyBush.shoot();
		assertFalse(moneyBush.canShoot());
		assertTrue(moneyBush.toString().startsWith("Money Bush"));

		// Millennium Falcon coverage
		MillenniumFalcon mF = (MillenniumFalcon) testModel.getDefenderAt(1, 0);
		mF.shoot();
		assertTrue(mF.canShoot());
		assertTrue(mF.toString().startsWith("Millennium Falcon"));
		mF.shotOne();
		mF.shotTwo();

		// Tars coverage
		Tars tars = (Tars) testModel.getDefenderAt(1, 1);
		tars.shoot();
		assertTrue(tars.canShoot());
		assertTrue(tars.toString().startsWith("Tars"));

		// MoneyTree coverage
		MoneyTree moneyTree = (MoneyTree) testModel.getDefenderAt(1, 2);
		moneyTree.shoot();
		assertFalse(moneyTree.canShoot());
		assertTrue(moneyTree.toString().startsWith("Money Tree"));

		// If there is already a Character on the board
		testController.placeCharacter(new Asteroid(), 0, 0);

		// Remove the tile
		testModel.removeTower(startrell, 0, 0);

		// Run the pause and play testing
		assertEquals(1, testController.getSpeedMultiplier());
		

		// First wave
		testController.waveOneSpawn();
		testController.waveOnePtFiveSpawn();

		// Second wave
		testController.waveTwoSpawn();
		testController.waveTwoPtFiveSpawn();

		// Third wave
		testController.waveThreeSpawn();

		testController.placeCharacter(moneyTree, 0, 0);

		// Remove the tile
		testModel.removeTower(moneyTree, 0, 0);

		assertNotEquals(0, testModel.getAliens().size());

		// Test the wave timer tasks
		testModel.setWaveNumber(2);
		testController.generateAliens();
		assertNotNull(testController.firstWave);
		assertNotNull(testController.secondWave);

		testController.firstWave = null;
		testController.secondWave = null;

		testModel.setWaveNumber(1);
		testController.generateAliens();
		assertNotNull(testController.firstWave);
		assertNotNull(testController.secondWave);

		testController.firstWave = null;
		testController.secondWave = null;

		testModel.setWaveNumber(3);
		testController.generateAliens();
		assertNotNull(testController.firstWave);
		assertNull(testController.secondWave);

		// Test speed multiplication
		// assertEquals(testController.getSpeedMultiplier(), 1);
		// testController.increaseSpeed();
		// assertEquals(testController.getSpeedMultiplier(), 2);

		// Test the setup of assignMap
		assertTrue(testController.getRestrictedTiles().isEmpty());
		testController.assignMap(2);
		assertFalse(testController.getRestrictedTiles().isEmpty());

		testModel.setRestrictionedTiles(new HashMap<Integer, Set<Integer>>());

		testController.assignMap(3);
		assertFalse(testController.getRestrictedTiles().isEmpty());
		assertEquals(testController.getRestrictedTiles().get(0).size(), 3);

		// Game mode tests
		testController.assignGameMode(1);
		assertEquals(testController.costMultiplier, 1);
		testController.assignGameMode(2);
		assertEquals(testController.costMultiplier, 2);

		// Game over tests
		LittleGreenMen greenMan = new LittleGreenMen();
		assertFalse(testController.isGameOver(greenMan));
		greenMan.setCol(0);
		// assertTrue(testController.isGameOver(greenMan));

		// Bullet Tests
		testModel.addBullet(new AstroJoeAmmo(astroJoe));
		assertFalse(testModel.getBullets().isEmpty());
		testController.playBulletNoise(new AstroJoeAmmo(astroJoe));
		testController.playBulletNoise(new ExplosiveAstroJoeAmmo(eAstroJoe));
		testController.playBulletNoise(new StartrellClugginsAmmo(startrell));
		testController.playBulletNoise(new MoonZeusAmmo(zeus));
		testController.playBulletNoise(new TarsAmmo(tars));

		// Remove Tower
		testController.removeTower(startrell, 0, 0);
		assertTrue(testModel.isAvailable(0, 0));
		testController.removeTower(mF, 1, 0);
		assertTrue(testModel.isAvailable(1, 0));
		
		// Character testing
		assertFalse(startrell.isDead());
		assertNotNull(startrell.getImage());
		startrell.setHealth(0);
		assertTrue(startrell.isDead());
		startrell.setDamage(0);
		
		//Alien Testing
		assertTrue(greenMan.toString().startsWith("LittleGreenMen"));
		
		Gargantua gargan = new Gargantua();
		assertTrue(gargan.toString().startsWith("Gargantua"));
		
		Grunt grunt = new Grunt();
		assertTrue(grunt.toString().startsWith("Grunt"));
		
		ManHunter mh = new ManHunter();
		assertTrue(mh.toString().startsWith("ManHunter"));
		
		Sprinter sprinter = new Sprinter();
		assertTrue(sprinter.toString().startsWith("Sprinter"));
		
		Tank tank = new Tank();
		assertTrue(tank.toString().startsWith("Tank"));
		assertFalse(tank.isAttacking());
		tank.setAttacking(true);
		assertTrue(tank.isAttacking());
		assertNotEquals(tank.getDieView(), tank.getAttackView());
		
		tank.setStackPane();
		assertNotNull(tank.getStackPane());
		tank.triggerAnimation(Enemy.ATTACK_ID);
		
		//Move message tests
		MoveMessage mm = new MoveMessage(MoveMessage.VALID_MOVE, tank, 0, 0, false);
		assertEquals(0, mm.getCol());
		assertEquals(0, mm.getRow());
		assertFalse(mm.isRemove());
		assertEquals(mm.getType(), 2);
		assertEquals(mm.getCharacter(), tank);
		
		//Tile testing
		ImageView iv;
		iv = testModel.getBoard()[0][0].getImageView();
		testModel.getBoard()[1][0].setImageView(iv);
		assertEquals(testModel.getBoard()[1][0].getImageView(), iv);
		
		Image i;
		i = testModel.getBoard()[0][0].getImage();
		testModel.getBoard()[1][0].setImage(i);
		assertEquals(testModel.getBoard()[1][0].getImage(), i);
		
		
	}

}
